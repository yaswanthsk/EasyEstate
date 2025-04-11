import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landingbody from './Components/Landingpage/Landingbody';
import Customerlandingpage from './Components/Customer/Customerlandingpage/Customerlandingpage';
import 'bootstrap/dist/css/bootstrap.min.css';
import Forgetpassword from './Components/Auth/Login/Forgetpassword/Forgetpassword';
import Resetpassword from './Components/Auth/Login/Resetpassword/Resetpassword';
import Profiledetails from './Components/Profiledetails/Profiledetails';
import Properties from './Components/Customer/Properties/Properties';
import Customerwishlist from './Components/Customer/Customerwishlist/Customerwishlist';
import Propertydetails from './Components/Customer/Customerpropertydetails/Propertydetails';
import Ownerlandingpage from './Components/Owner/Ownerlandingpage/Ownerlandingpage';
import Customerrequests from './Components/Customer/Customerrequests/Customerrequests';
import Addproperty from './Components/Owner/Addproperty/Addproperty';
import Ownerproperties from './Components/Owner/Ownerproperties/Ownerproperties';
import Propertyrequests from './Components/Owner/Propertyrequests/Propertyrequests';
import Ownerpropertydetails from './Components/Owner/Ownerpropertydetails/Propertydetails';
import UpdateProperty from './Components/Owner/Updateproperty/Updateproperty';
import Customerprofiledetails from './Components/Customer/Customerprofiledetails/Customerprofiledetails';
import Ownerprofiledetails from './Components/Owner/Ownerprofiledetails/Ownerprofiledetails';
import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import Subscription from './Components/Owner/Subscription/Subscription';
import Subscriptiondata from './Components/Owner/Subscriptiondata/Subscriptiondata';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



function App() {
  
  const ProtectedRoute = ({ element, role, ...rest }) => {
 
    const token = localStorage.getItem("token");
    if (!token) {
      return <Navigate to="/" />;
    }
 
    try {
      const decodedToken = jwtDecode(token);
      const Role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decodedToken.role;
      if (Role !== role) {
        return <Navigate to="/" />;
      }
    } catch (error) {
      return <Navigate to="/" />;
    }
    return element;
  };

  return (
    <>
    <Router>
      <Routes>
        <Route path="/customerlanding" element={<ProtectedRoute element={<Customerlandingpage />} role="Customer" />}/>
        <Route path="/Properties" element={<ProtectedRoute element={<Properties />} role="Customer" />}/>
        <Route path="/customerwishlist" element={<ProtectedRoute element={<Customerwishlist />} role="Customer" />}/>
        <Route path="/Customerpropertydetails/:propertyID" element={<ProtectedRoute element={<Propertydetails />} role="Customer" />}/>     
        <Route path="/CustomerSideRequests" element={<ProtectedRoute element={<Customerrequests />} role="Customer" />}/>
        <Route path="/Customerprofiledetails" element={<ProtectedRoute element={<Customerprofiledetails />} role="Customer" />}/>


        <Route path="/Ownerprofiledetails" element={<ProtectedRoute element={<Ownerprofiledetails />} role="Owner" />}/>
        <Route path="/Addproperty" element={<ProtectedRoute element={<Addproperty />} role="Owner" />}/>
        <Route path="/Ownerproperties" element={<ProtectedRoute element={<Ownerproperties />} role="Owner" />}/>
        <Route path="/Propertyrequests" element={<ProtectedRoute element={<Propertyrequests />} role="Owner" />}/>
        <Route path="/Ownerpropertydetails/:propertyID" element={<ProtectedRoute element={<Ownerpropertydetails />} role="Owner" />}/>
        <Route path="/Updateproperty" element={<ProtectedRoute element={<UpdateProperty />} role="Owner" />}/>
        <Route path="/ownerlanding" element={<ProtectedRoute element={<Ownerlandingpage />} role="Owner" />}/>


        <Route exact path='/' element={<Landingbody />} />
        <Route path='/ProfileDetails' element={<Profiledetails/>}/>
        <Route path='/forgetpassword' element={<Forgetpassword/>}/>
        <Route path='/reset' element={<Resetpassword/>}/>
        <Route path='/Subscription' element={<ProtectedRoute element={<Subscription/>} role="Owner"/>}/>
        <Route path='Subscriptiondata' element={<ProtectedRoute element={<Subscriptiondata/>} role="Owner"/>}/>

      </Routes>
    </Router>
         <ToastContainer />
         </>
  );
}

export default App;
