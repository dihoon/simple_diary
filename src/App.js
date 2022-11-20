import "./App.css";
import React, {useCallback, useRef, useEffect, useMemo, useReducer} from "react";
import DiaryEditor from "./DiaryEditor";
import DiaryList from "./DiaryList";

const reducer = (state, action) => {
  switch (action.type) {
    case 'INIT': {
      return action.data
    }
    case 'CREATE': {
      const created_date = new Date().getTime();
      const newItem = {
        ...action.data,
        created_date,
      }
      return [newItem, ...state];
    }
    case 'DELETE':{
      return state.filter(x=>x.id !== action.targetId);
    }
    case 'EDIT': {
      return state.map(x=>x.id === action.targetId ? 
        {...x, content: action.newContent} : x);
    }
    default :
      return state;
  }
};

export const DiaryStateContext = React.createContext(); // data 공급

export const DiaryDispatchContext = React.createContext();

function App() {

  const dataId = useRef(0);

  const [data, dispatch] = useReducer(reducer, []);

  const getData = async () => {
    const res = await fetch('https://jsonplaceholder.typicode.com/comments').then(res=>res.json());
    console.log(res);

    const initData = res.slice(0,20).map(x=>{
      return {
        author: x.email,
        content: x.body,
        emotion: Math.floor(Math.random()*5 + 1),
        created_date : new Date().getTime(),
        id : dataId.current++
      }
    })

    dispatch({type:"INIT", data:initData});
  };

  useEffect(()=>{
    getData();
  }, []);

  const onCreate = useCallback((author, content, emotion) => {
    dispatch({type:'CREATE', data:{author, content, emotion, id:dataId.current}})
    dataId.current += 1;
  }, []);

  const onDelete = useCallback((targetId) => {
    dispatch({type:"DELETE", targetId});
  }, []);

  const onEdit = useCallback((targetId, newContent) => {
    dispatch({type:'EDIT', targetId, newContent});
  },[]);

  const memoizedDispatches = useMemo(()=>{
    return {onCreate, onDelete, onEdit}
  }, []);

  // useMemo는 함수가 아니라 값을 반환한다.
  const getDiaryAnalysis = useMemo(() => {

    const goodCount = data.filter(x=>x.emotion >=3).length;
    const badCount = data.length - goodCount;
    const goodRatio = (goodCount/data.length) * 100;
    return {goodCount, badCount, goodRatio};
  }, [data.length]);

  const {goodCount, badCount, goodRatio} = getDiaryAnalysis;

  return (
    <DiaryStateContext.Provider value={data}>
      <DiaryDispatchContext.Provider value={memoizedDispatches}>
        <div className="App">
          <DiaryEditor/>
          <div>전체 일기 : {data.length}</div>
          <div>기분 좋은 일기 개수 : {goodCount}</div>
          <div>기분 나쁜 일기 개수 : {badCount}</div>
          <div>기분 좋은 일기 비율 : {goodRatio}</div>
          <DiaryList/>
        </div>
      </DiaryDispatchContext.Provider>
    </DiaryStateContext.Provider>
  );
}

export default App;
