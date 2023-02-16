import {React,useState} from 'react'
import { useNavigate } from "react-router-dom";
import axios from 'axios'
import { useToast } from '@chakra-ui/react';

export default function Signup(){

  const toast = useToast()
  const navigate = useNavigate()

    let [formData,setFormData]=useState({email:"",password:"",confirm:""});
    var image;
    
    function handleImage(event){
      setFormData({...formData, image:event.target.files[0]})
    }

    async function submitHandler(){
      if(!formData.email || !formData.password || !formData.confirm || !formData.image){
        console.log("Please Enter all information")
        return
      }
      if(formData.password !== formData.confirm){
        console.log("Passwords Doesn't match")
        return
      }

      // console.log(formData)

      const form = new FormData()

      form.append('image', formData.image, formData.image.name)
      form.append('name', formData.name)
      form.append('email', formData.email)
      form.append('password', formData.password)


      const config = {     
        headers: { 'content-type': 'multipart/form-data' }
    }

      const {data} = await axios.post('http://localhost:7000/signup', form, config)
      if(data.data){
        toast({
          title:`${data.data}`,
          status:"warning",
          isClosable:true,
          duration:3000,
          position:'bottom'
        })
      }
      else{
        toast({
          title:`User Created Successfully`,
          status:"success",
          isClosable:true,
          duration:3000,
          position:'bottom'
        })
        localStorage.setItem('user', JSON.stringify(data))
        navigate('/product')
      }
    }

    return (
        <div className="bg-[#000000] flex flex-col justify-top items-center min-h-[100vh] w-[100%] h-[100%] m-0% " >
          <div><img alt="" src="./Amaze_ON.png"  height="200" width="200"/></div>
            <div className="bg-[#a8a29e]   flex flex-col items-center w-[440px] h-[480px] rounded-[10px]">   
            

              <p className=" font-semibold w-[350px] mt-5 mb-0.5">Name</p>
                <input type="text" className="bg-gray w-[350px] h-[40px] rounded-[5px] hover:border-2 border-[#F97707] focus:outline-none p-2.5 dark:bg-[#d9d9d9]" placeholder='Enter your Name'  onChange={(e)=>{
                  setFormData({...formData,name : e.target.value})
              }}/>

              <p className=" font-semibold w-[350px] mt-5 mb-0.5">Email</p>
                <input type="email" className="bg-gray w-[350px] h-[40px] rounded-[5px] hover:border-2 border-[#F97707] focus:outline-none p-2.5 dark:bg-[#d9d9d9]" placeholder='Enter your gmail'  onChange={(e)=>{
                  setFormData({...formData,email : e.target.value})
              }}/>
            
            <p className="font-semibold w-[350px] mt-2 mb-0.5">Password</p>
              <input className="h-[40px]  rounded-[5px] hover:border-2 border-[#F97707] focus:outline-none w-[350px] p-2.5  dark:bg-[#d9d9d9]  " type="password" placeholder="Password" onChange={(e)=>{
                  setFormData({...formData,password : e.target.value})
                }}/>
            <p className="font-semibold w-[350px] mt-2 mb-0.5">Confirm Password</p>
              <input className="h-[40px]  rounded-[5px] hover:border-2 border-[#F97707] focus:outline-none w-[350px] p-2.5  dark:bg-[#d9d9d9]  " type="password" placeholder="Password" onChange={(e)=>{
                  setFormData({...formData,confirm : e.target.value})
                }}/>
              <p className="font-semibold w-[350px] mt-2 mb-0.5">Profile Picture</p>
              <input className="h-[50px]  rounded-[5px] hover:border-2 border-[#F97707] focus:outline-none w-[350px] p-2.5 mb-5  dark:bg-[#d9d9d9]" name="image" type="file" accept="Image/*" onChange={handleImage}/>
            <button className="w-[350px] bg-[#f97316] hover:bg-[#fb923c] text-white font-bold py-2 px-4 rounded-[5px]" onClick={()=>submitHandler()}>Create Account</button>
            </div>
          </div>
    );

}
