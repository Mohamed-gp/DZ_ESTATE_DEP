import useAuth from "./useAuth";

export default function useLogout() {
  const {setAuth} = useAuth()
  const logout = async()=>{
    setAuth({})
    try {
         await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`,{
            credentials: 'include',
        })
        localStorage.removeItem('accessToken')
        
    } catch (err) {
        console.log("error in the logout hoc in the front-end" , err)
    }
  }
  
    return logout
}