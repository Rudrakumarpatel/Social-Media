import React, { useEffect, useState } from "react";
import "./FollowersCard.css";

import { Followers } from "../../Data/FollowersData";
import User from "../User/User";
import { getAllUser } from "../../api/UserRequest";
import { useSelector } from "react-redux";
const FollowersCard = () => {
  const { user } = useSelector((state) => state.authReducer.authData);
  const [persons, setPersons] = useState([]);

  useEffect(() => {
    const fetchPersons = async () => {
      const { data } = await getAllUser();
      setPersons(data);
      console.log(data);
    };
    fetchPersons();
  }, []);

  return (
    <div className="FollowersCard">
      <h3>Who is following you</h3>

      {persons.map((person, id) => {
        if(person._id !== user._id)
        {
        return <User person={person} key={id}></User>;
        }
      })}
    </div>
  );
};

export default FollowersCard;
