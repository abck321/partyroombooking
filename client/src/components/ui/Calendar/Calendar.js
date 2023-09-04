import { useState, useEffect } from 'react';
import moment from 'moment';
import axios from 'axios';
import './Calendar.css';
import { API_BASE_URL } from '../../../config'

import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
const Calendar = ({partyRoomId, onButtonClick, loading}) => {
    const width = "700px";

    const [dateContext, setDataContext] = useState(moment());    
    const [showMonthPopup, setShowMonthPopup] = useState(false);
    const [showYearNav, setShowYearNav] = useState(false);
    const month = dateContext.format("MMMM");
    const year = dateContext.format("Y");
    const weekdaysShort = moment.weekdaysShort();

    const months = moment.months();
    
    const onChangeMonth = (e, month) => {
        setShowMonthPopup(!showMonthPopup);
    }
    
    const onSelectChange = (e, data) => {
        setDataContext(moment(dateContext).set("month", months.indexOf(data)));
    }

    const prevMonth = () => {
        setDataContext(moment(dateContext).subtract(1, "month"));
    }

    const nextMonth = () => {
        setDataContext(moment(dateContext).add(1, "month"));
    }

    const onKeyUpYear = (e) => {
        if (e.which === 13 || e.which === 27) {
            setDataContext(moment(dateContext).set("year", e.target.value));
            setShowYearNav(false);
        }
    }
    const onYearChange = (e) => {
        setDataContext(moment(dateContext).set("year", e.target.value));
    }
    
    const showYearEditor = () => {
        setShowYearNav(!showYearNav);
    }

    const handleButtonDisabled = async (partyRoomId, date) => {
        const partyRoomData = {
            partyRoomId,
            date,
        }
        const res = await axios.post(`${API_BASE_URL}/partyroom/buttondisable`, partyRoomData);
        return res.data;
    }

    const firstDayOfMonth = () => {
        let firstDay = moment(dateContext).startOf('month').format('d'); // Day of week 0...1..5...6
        return firstDay;
    }

    let blanks = [];
    for (let i = 0; i < firstDayOfMonth(); i++) {
        blanks.push(<td key={i * 80} className="emptySlot">
            {""}
            </td>
        );
    }

    let daysInMonth = [];
    for (let d = 1; d <= dateContext.daysInMonth(); d++) {
        daysInMonth.push(
            <td key={d} className="day" >
                <div>{d}</div>
                <PromiseRender
                    promise={handleButtonDisabled(partyRoomId, moment(dateContext).format("YYYY-MM") + "-" + String(d).padStart(2, '0'))} 
                    day={d}
                    currentDate={moment(dateContext.currentDate).format("YYYY-MM-DD")}
                    buttonDate={moment(dateContext).format("YYYY-MM") + "-" + String(d).padStart(2, '0')}
                    onButtonClick={onButtonClick}
                    loading={loading}
                />
            </td>
        );
    }
    
    const totalSlots = [...blanks, ...daysInMonth];
    let rows = [];
    let cells = [];

    totalSlots.forEach((row, i) => {
        if ((i % 7) !== 0) {
            cells.push(row);
        } else {
            let insertRow = cells.slice();
            rows.push(insertRow);
            cells = [];
            cells.push(row);
        }
        if (i === totalSlots.length - 1) {
            let insertRow = cells.slice();
            rows.push(insertRow);
        }
    });

    return (
        <div className="calendar-container" style={ {width:width} }>
            <table className="calendar">
                    <thead>
                        <tr className="calendar-header">
                            <td colSpan="7">
                                <div className='prev-month-next-year-selector'>
                                    <i className="prev-icon"
                                        onClick={(e)=> {prevMonth()}}>
                                            <ArrowBackIcon/>
                                    </i>
                                    <span className="label-month" onClick={(e)=> {onChangeMonth(e, month)}}>
                                        {month}
                                        {showMonthPopup &&
                                            <div className="month-popup">
                                                {months.map((month) => (
                                                    <span key={month}>
                                                        <div onClick={(e) => onSelectChange(e, month)}>
                                                            {month}
                                                        </div>
                                                    </span>
                                                ))}
                                            </div>
                                        }
                                    </span>
                                    <i className="next-icon"
                                        onClick={(e)=> {nextMonth()}}>
                                            <ArrowBackIcon style={{transform: "scaleX(-1)"}}/>
                                    </i>
                                    {" "}
                                    {showYearNav ?
                                        <input
                                            defaultValue = {year}
                                            className="editor-year"
                                            onKeyUp= {(e) => onKeyUpYear(e)}
                                            onChange = {(e) => onYearChange(e)}
                                            type="number"
                                            placeholder="year"
                                        />
                                        :
                                        <span
                                            className="label-year"
                                            onClick={(e)=> { showYearEditor()}}>
                                            {year}
                                        </span>}
                                </div>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {weekdaysShort.map((day)=> (
                                <td key={day} className="week-day">{day}</td>
                            ))}
                        </tr>
                        {rows.map((d, i) =>(
                            <tr key={i*100}>
                                {d}
                            </tr>
                        ))}
                    </tbody>
                </table>
        </div>
    )
}

const PromiseRender = ({ promise, day, currentDate, buttonDate, onButtonClick, loading }) => {
    const [buttonDisabled, setButtonDisabled] = useState(null);
    const currentDateFormat = new Date(currentDate);
    const buttonDateFormat = new Date(buttonDate);
    useEffect(() => {
      let isMounted = true;
      promise.then((result) => {
        if (isMounted) {
          setButtonDisabled(result);
        }
      }).catch((error) => {
        console.error(error);
      });
  
      return () => {
        isMounted = false;
      };
    }, [promise]);
  
    if (buttonDisabled === null) {
      return <Button>Loading...</Button>;
    }
  
    return currentDateFormat <= buttonDateFormat ? (buttonDisabled ? (
        <Button disabled={true}>Fully Booked</Button>
    ) : (
      <Button disabled={loading} onClick={() => onButtonClick(buttonDate)}>Select</Button>
    )) : <Button disabled={true}>Date passed</Button>;
};

export default Calendar;