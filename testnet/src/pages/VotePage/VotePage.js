import React from "react";
import { Link } from "react-router-dom";
import './VotePage.scss';

const VotingPage = ({darkTheme}) => {
   return (
       <div className="voting__page">
         <div className="voting__header" 
          //  style={{
          //   backgroundColor: darkTheme? "#161616" : "white",
          //   opacity: "0.8",
          //   backgroundImage: "radial-gradient(#b0adad 1.1px, #161616 1.1px)",
          //   // background-size: 22px 22px;
          //  }}
         >
             <h1>Vote and Propose Issues </h1>
             <p> Vote on existing issues or propose a new issue for decentralized governance.</p>
         </div> 
         <div className="voting__card_header">
             <div className="voting__card">
               <h1>Vote  </h1>
               <p>  Vote on existing issues.  </p>
               <Link to='/participate'>
                 <button> Vote </button>
               </Link>
             </div>
             <div className="voting__card">
             <h1>Propose  </h1>
               <p>  Propose a new issue for decentralized governance. </p>
               <Link to='/propose'>
                <button> Propose</button>
               </Link>
              
             </div>
         </div>
       </div>
   )
}

export default VotingPage;
