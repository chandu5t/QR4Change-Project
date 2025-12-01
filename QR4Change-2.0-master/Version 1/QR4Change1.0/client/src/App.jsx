import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import SignUp from './components/SignUp/Signup';
import SignIn from './components/SignIn/Signin';
import Home from './components/Home/Home'
import Dashboard from './components/Dashboard/Dashboard';
import ComplaintForm from './components/ComplaintForm/ComplaintForm'



import AdminLogin from './admin/AdminLogin/AdminLogin'
import AdminDashboard from './admin/AdminDashboard/AdminDashboard'
import PublicDashboard from './components/Public Dashboard/PublicDashboard';



function App() {
  return (
    <>
    <Toaster position="top-right" reverseOrder={false} />
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/complaint-form" element={<ComplaintForm />} />
      
      <Route path='/admin/login' element={<AdminLogin/>}/>
      <Route path='/admin/dashboard' element={<AdminDashboard/>}/>
      <Route path='/public/dashboard' element={<PublicDashboard/>}/>

      
       

       
      </Routes>
    </Router>
    </>
  );
}

export default App;
