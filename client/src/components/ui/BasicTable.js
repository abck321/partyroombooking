import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button } from '@mui/material';

export default function BasicTable({appointment, userId, handleConfirmBooking, handleCancelBooking, loading}) {

  return (
    <TableContainer component={Paper}>
        <h1>{appointment.partyRoomName}</h1>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Date: </TableCell>
            <TableCell align="center">Start Time:</TableCell>
            <TableCell align="center">End Time: </TableCell>
            <TableCell align="center">Confirmed?</TableCell>
            <TableCell align="center"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {appointment.timeslots.map((timeslot) => (
            <TableRow
              key={timeslot.date + "-" + timeslot.startTime}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {timeslot.date}
              </TableCell>
              <TableCell align="center">{timeslot.startTime}</TableCell>
              <TableCell align="center">{timeslot.endTime}</TableCell>
              <TableCell align="center">{timeslot.confirm ? "Confirmed" : 
                <Button disabled={loading} onClick={() => handleConfirmBooking(timeslot.appointmentId, userId)}>Confirm here</Button> }
              </TableCell>
              <TableCell align="center"><Button disabled={loading} onClick={() => handleCancelBooking(timeslot.appointmentId, userId)}>Cancel</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}