import React from 'react';
import moment from 'moment';
import axios from 'axios';
import './Calendar.css';
import { API_BASE_URL } from '../../../config'

import { Button } from '@mui/material';

export default class Calendar extends React.Component {
    state = {
        dateContext: moment(),
        today: moment(),
        showMonthPopup: false,
        showYearPopup: false,
        selectedDay: null,
        isLoading: false
    }

    constructor(props) {
        super(props);
        this.width = props.width || "700px";
        this.style = props.style || {};
        this.style.width = this.width; // add this
    }


    weekdays = moment.weekdays(); //["Sunday", "Monday", "Tuesday", "Wednessday", "Thursday", "Friday", "Saturday"]
    weekdaysShort = moment.weekdaysShort(); // ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    months = moment.months();

    year = () => {
        return this.state.dateContext.format("Y");
    }
    month = () => {
        return this.state.dateContext.format("MMMM");
    }
    daysInMonth = () => {
        return this.state.dateContext.daysInMonth();
    }
    currentDate = () => {
        return this.state.dateContext.get("date");
    }
    currentDay = () => {
        return this.state.dateContext.format("D");
    }

    firstDayOfMonth = () => {
        let dateContext = this.state.dateContext;
        let firstDay = moment(dateContext).startOf('month').format('d'); // Day of week 0...1..5...6
        return firstDay;
    }

    setMonth = (month) => {
        let monthNo = this.months.indexOf(month);
        let dateContext = Object.assign({}, this.state.dateContext);
        dateContext = moment(dateContext).set("month", monthNo);
        this.setState({
            dateContext: dateContext
        });
    }

    nextMonth = () => {
        let dateContext = Object.assign({}, this.state.dateContext);
        dateContext = moment(dateContext).add(1, "month");
        this.setState({
            dateContext: dateContext
        });
        this.props.onNextMonth && this.props.onNextMonth();
    }

    prevMonth = () => {
        let dateContext = Object.assign({}, this.state.dateContext);
        dateContext = moment(dateContext).subtract(1, "month");
        this.setState({
            dateContext: dateContext
        });
        this.props.onPrevMonth && this.props.onPrevMonth();
    }

    onSelectChange = (e, data) => {
        this.setMonth(data);
        this.props.onMonthChange && this.props.onMonthChange();

    }
    
    SelectList = (props) => {
        let popup = props.data.map((data) => {
            return (
                <div key={data}>
                    <span onClick={(e)=> {this.onSelectChange(e, data)}}>
                        {data}
                    </span>
                </div>
            );
        });

        return (
            <div className="month-popup">
                {popup}
            </div>
        );
    }

    onChangeMonth = (e, month) => {
        this.setState({
            showMonthPopup: !this.state.showMonthPopup
        });
    }

    MonthNav = () => {
        return (
            <span className="label-month"
                onClick={(e)=> {this.onChangeMonth(e, this.month())}}>
                {this.month()}
                {this.state.showMonthPopup &&
                 <this.SelectList data={this.months} />
                }
            </span>
        );
    }

    showYearEditor = () => {
        this.setState((prevState) => ({
            showYearNav: !prevState.showYearNav
        }));
    }

    setYear = (year) => {
        let dateContext = Object.assign({}, this.state.dateContext);
        dateContext = moment(dateContext).set("year", year);
        this.setState({
            dateContext: dateContext
        })
    }
    onYearChange = (e) => {
        this.setYear(e.target.value);
        this.props.onYearChange && this.props.onYearChange(e, e.target.value);
    }

    onKeyUpYear = (e) => {
        if (e.which === 13 || e.which === 27) {
            this.setYear(e.target.value);
            this.setState({
                showYearNav: false
            })
        }
    }

    YearNav = () => {
        return (
            this.state.showYearNav ?
            <input
                defaultValue = {this.year()}
                className="editor-year"
                ref={(yearInput) => { this.yearInput = yearInput}}
                onKeyUp= {(e) => this.onKeyUpYear(e)}
                onChange = {(e) => this.onYearChange(e)}
                type="number"
                placeholder="year"
            />
            :
            <span
                className="label-year"
                onClick={(e)=> { this.showYearEditor()}}>
                {this.year()}
            </span>
        );
    }

    onDayClick = (e, day) => {
        this.setState({
            selectedDay: day
        }, () => {
            console.log(moment(this.state.dateContext).format("YYYY-MM")+ "-" + String(this.state.selectedDay).padStart(2, '0'));
        });

        this.props.onDayClick && this.props.onDayClick(e, day);
    }

    handleButtonDisabled = async (partyRoomId, date) => {
        const partyRoomData = {
            partyRoomId,
            date,
        }
        const res = await axios.post(`${API_BASE_URL}/partyroom/buttondisable`, partyRoomData);
        return res.data;
    }

    render() {
        // Map the weekdays i.e Sun, Mon, Tue etc as <td>
        let weekdays = this.weekdaysShort.map((day) => {
            return (
                <td key={day} className="week-day">{day}</td>
            )
        });

        let blanks = [];
        for (let i = 0; i < this.firstDayOfMonth(); i++) {
            blanks.push(<td key={i * 80} className="emptySlot">
                {""}
                </td>
            );
        }

        let daysInMonth = [];
        for (let d = 1; d <= this.daysInMonth(); d++) {
            daysInMonth.push(
                <td key={d} className={"day"} >
                    <div>{d}</div>
                    <PromiseRender
                        promise={this.handleButtonDisabled(this.props.partyRoomId, moment(this.state.dateContext).format("YYYY-MM") + "-" + String(d).padStart(2, '0'))} 
                        day={d}
                        currentDate={moment(this.state.dateContext.currentDate).format("YYYY-MM-DD")}
                        buttonDate={moment(this.state.dateContext).format("YYYY-MM") + "-" + String(d).padStart(2, '0')}
                        onButtonClick={this.props.onButtonClick}
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
        
        let trElems = rows.map((d, i) => {
            
            return (
                <tr key={i*100}>
                    {d}
                </tr>
            );
        })

        return (
            <div className="calendar-container" style={this.style}>
                <table className="calendar">
                    <thead>
                        <tr className="calendar-header">
                            <td colSpan="5">
                                <this.MonthNav />
                                {" "}
                                <this.YearNav />
                            </td>
                            <td colSpan="2" className="nav-month">
                                <i className="prev fa fa-fw fa-chevron-left"
                                    onClick={(e)=> {this.prevMonth()}}>
                                </i>
                                <i className="prev fa fa-fw fa-chevron-right"
                                    onClick={(e)=> {this.nextMonth()}}>
                                </i>

                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {weekdays}
                        </tr>
                        {trElems}
                    </tbody>
                </table>

            </div>

        );
    }
}

const PromiseRender = ({ promise, day, currentDate, buttonDate, onButtonClick }) => {
    const [buttonDisabled, setButtonDisabled] = React.useState(null);
    const currentDateFormat = new Date(currentDate);
    const buttonDateFormat = new Date(buttonDate);
    React.useEffect(() => {
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
      <Button onClick={() => onButtonClick(buttonDate)}>Select</Button>
    )) : <Button disabled={true}>Date passed</Button>;
};