import "./App.css";
import {useState, useRef, useEffect} from "react";
import DiaryEditor from "./DiaryEditor";
import DiaryList from "./DiaryList";

// https://jsonplaceholder.typicode.com/comments

function App() {

  const dataId = useRef(0);

  const [data, setData] = useState([]);

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

    setData(initData);
  };

  useEffect(()=>{
    getData();
  }, []);

  const onCreate = (author, content, emotion) => {
    const created_date = new Date().getTime();
    const newItem = {
      author,
      content,
      emotion,
      created_date,
      id : dataId.current
    }
    dataId.current += 1;
    setData([newItem, ...data]);
  }

  const onDelete = (targetId) => {
    console.log(`${targetId}가 삭제되었습니다.`);
    const newDiaryList = data.filter(x=>x.id !== targetId);
    setData(newDiaryList);
  }

  const onEdit = (targetId, newContent) => {
    setData(
      data.map(x=>x.id === targetId ? {...x, content:newContent} : x)
    );
  }

  return (
    <div className="App">
      <DiaryEditor onCreate={onCreate}/>
      <DiaryList diaryList={data} onDelete={onDelete} onEdit={onEdit}/>
    </div>
  );
}

export default App;
