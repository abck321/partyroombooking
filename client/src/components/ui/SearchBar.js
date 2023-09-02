import React, { useState } from "react";

const SearchBar = ({ onSearch }) => {
    const [keyword, setKeyword] = useState("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("00:00");
    const [endTime, setEndTime] = useState("01:00");
    const [location, setLocation] = useState("");
    const [options2, setOptions2] = useState([]);

    const handleTime1Change = e => {
        const selectedTime1 = e.target.value;
        setStartTime(selectedTime1);

        const selectedHour = parseInt(selectedTime1.split(":")[0], 10);
        const newOptions2 = Array.from({ length: 24 - selectedHour - 1 }).map((_, index) => {
        const hour = String(selectedHour + index + 1).padStart(2, "0");
        return hour + ":00";
        });
        setOptions2(newOptions2);
    };

    const handleTime2Change = e => {
        setEndTime(e.target.value);
    };

    const handleSearch = () => {
        /* onSearch(keyword, date, startTime, endTime, location); */
        onSearch(keyword, date, location);
    };

    return (
        <div>
        <input
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="Search by keyword"
        />
        <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
        />
        {/* <select value={startTime} onChange={handleTime1Change}>
            {Array.from({ length: 24 }).map((_, index) => {
            const hour = String(index).padStart(2, "0");
            return (
                <option key={hour} value={hour + ":00"}>
                {hour + ":00"}
                </option>
            );
            })}
        </select>
        <select value={endTime} onChange={handleTime2Change}>
            {startTime === "00:00"? (
            Array.from({ length: 24 }).map((_, index) => {
                const hour = String(index + 1).padStart(2, "0");
                return (
                <option key={hour} value={hour + ":00"}>
                    {hour + ":00"}
                </option>
                );
            })
            ): (
            options2.map(option => (
                <option key={option} value={option}>
                {option}
                </option>
            ))
            )}
        </select> */}
        <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Search by location"
        />
        <button onClick={handleSearch}>Search</button>
        </div>
    );
};

export default SearchBar;