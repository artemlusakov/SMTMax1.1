import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"

const getData = async (): Promise<Post[]> => {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts")
  return response.json()
}


export function usePost (isEnabled: boolean){

    const { data, isLoading, isSuccess, isError } = useQuery({
      queryKey: ['posts'],
      queryFn: getData,
      enabled: isEnabled,
    })

    useEffect(()=>{
      if(isSuccess)console.log('data is Success');
    }, [isSuccess, data])
  
    useEffect(()=>{
      if(isError)console.log('Error getData');
    },[ isError,data])

  return{ data, isLoading, isSuccess, isError }
}