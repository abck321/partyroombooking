import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';


export default function BasicCard({partyRoom}) {
  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Party Room Name: {partyRoom.name}
        </Typography>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" component="div">
          Location: {partyRoom.location}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          Description: {partyRoom.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Link to={`/partyroomdetail?id=${partyRoom.partyRoomId}`}>
          <button >Select and check available timeslots</button>
        </Link>
      </CardActions>
    </Card>
  );
}