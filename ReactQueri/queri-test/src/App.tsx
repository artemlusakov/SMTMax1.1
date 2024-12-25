import { useQuery } from '@tanstack/react-query'
import './App.css'
import { useEffect, useState } from 'react';
import { usePost } from './usePost';

interface Post {
  id: number;
  title: string;
}

function App() {
  
  const [isAuto, setIsAuto] = useState(false);
  const{data,isLoading}=usePost(isAuto)
  return (
    <>
      <h1>Test Query</h1>
      <button onClick={() => setIsAuto(!isAuto)}>авторизовать</button>
      {isLoading ? (
        <div>Loading...</div>
      ) : data?.length ? (
        data.map((post: Post) => (
          <div key={post.id}>{post.title}</div>
        ))
      ) : (
        <div>No posts found</div>
      )}
    </>
  )
}

export default App