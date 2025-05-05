import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom'
import { useCurrentUser } from '../userProvider';
import styles from './userDetails.module.css'
// Some more details
const userDetails = () => {
  const emailRef = useRef();
  const phoneRef = useRef();
  const alertDivRef = useRef();
  const { currentUser, setCurrentUser } = useCurrentUser();
  const navigate = useNavigate();

  //update the text in alert div.
  const manageMassages = (message) => {
    alertDivRef.current.innerText = message;
  }

  //checks if the email address is valid.
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  //checks if the phone number is valid.
  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[0-9]{1,3}?[-\s]?[0-9]{9,12}$/;
    return phoneRegex.test(phone);
  };

  //Complete the register process. 
  const writeUserToDB = async () => {
    let newUser = {
      id: currentUser.id,
      username: currentUser.username,
      email: emailRef.current.value,
      phone: phoneRef.current.value,
      website: currentUser.website,
    }
    try {
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      })
      if (!response.ok)
        throw new Error(`Error: ${response.status}`);
      setCurrentUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      navigate('/home');
    } catch (err) {
      setError(err.message);
    }
  }
  //Check the details' validation.
  const handleDetailsSubmit = (event) => {
    event.preventDefault()
    if (!validateEmail(emailRef.current.value)) {//if email not valid
      if (!validatePhone(phoneRef.current.value)) {//if phone not valid too
        manageMassages("email and phone not valid!");
        emailRef.current.value = '';
        phoneRef.current.value = '';
      } else {
        manageMassages("email not valid!");//if only email not valid
        emailRef.current.value = '';
      }
    } else if (!validatePhone(phoneRef.current.value)) {//if only phone not valid
      manageMassages("phone not valid!");
      phoneRef.current.value = '';
    }
    else {
      writeUserToDB();
    }
  }

  return (
    <>
      <h3 className={styles.title}>More Details</h3>
      <div className={styles.steps}><strong>2</strong> / 2 STEPS</div>
      <form className={styles.form} onSubmit={handleDetailsSubmit}>
        <input className={styles.input} ref={emailRef} type="email" placeholder="email" required />
        <input className={styles.input} ref={phoneRef} type="tel" placeholder="phone number" required />
        <div className={styles.alert} ref={alertDivRef}></div>
        <button className={styles.button} type="submit">submit</button>
      </form>

    </>
  )
}

export default userDetails;