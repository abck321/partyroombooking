using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MySqlConnector;
using server.Models;

[ApiController]
[Route("api/[controller]")]
public class PartyRoomController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public PartyRoomController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpPost("list")]
    public async Task<IActionResult> List([FromBody] dynamic filterData)
    {
        try
        {
            List<PartyRoomDto> partyRoomDtoList = new List<PartyRoomDto>();

            string keyword = filterData.GetProperty("keyword").GetString();
            string date = filterData.GetProperty("date").GetString();
            string location = filterData.GetProperty("location").GetString();

            var connectionString = _configuration.GetConnectionString("MySqlConnection");

            using (var connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();

                string selectQuery = "";
                if (date == "")
                {
                    selectQuery = @"SELECT * FROM partyrooms 
                                    WHERE (name LIKE CONCAT('%', @keyword, '%') OR description LIKE CONCAT('%', @keyword, '%')) 
                                        AND location LIKE CONCAT('%', @location, '%') ";
                }
                else
                {
                    selectQuery = @"SELECT p.*
                                FROM partyrooms p
                                LEFT JOIN (
                                    SELECT partyroomId, COUNT(*) as bookingsCount
                                    FROM timeslots
                                    WHERE date = @SearchDate
                                        AND (create_time + INTERVAL 15 MINUTE >= NOW() OR confirm = 1)
                                    GROUP BY partyroomId
                                ) t ON t.partyroomId = p.id
                                WHERE (p.name LIKE CONCAT('%', @Keyword, '%') OR p.description LIKE CONCAT('%', @Keyword, '%'))
                                    AND p.location LIKE CONCAT('%', @Location, '%')
                                    AND (t.bookingsCount IS NULL OR t.bookingsCount < 24)";
                }
                using (var command = new MySqlCommand(selectQuery, connection))
                {
                    command.Parameters.AddWithValue("@Keyword", keyword);
                    if (date != "") command.Parameters.AddWithValue("@SearchDate", date);
                    command.Parameters.AddWithValue("@Location", location);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (reader.Read())
                        {
                            string partyRoomId = reader.GetString("id");
                            string partyRoomName = reader.GetString("name");
                            string partyRoomLocation = reader.GetString("location");
                            string partyRoomDescription = reader.GetString("description");

                            PartyRoomDto partyRoomDto = new PartyRoomDto
                            {
                                PartyRoomId = partyRoomId,
                                Name = partyRoomName,
                                Location = partyRoomLocation,
                                Description = partyRoomDescription
                            };

                            partyRoomDtoList.Add(partyRoomDto);
                        }
                    }
                }

                connection.Close();
            }

            return Ok(partyRoomDtoList);

        }
        catch (Exception)
        {
            return BadRequest("An error occurred during Party Room Search.");
        }
    }

    [HttpPost("appointment")]
    public async Task<IActionResult> Appointment([FromBody] dynamic userData)
    {
        string userId = userData.GetProperty("userId").GetString();

        List<AppointmentDto> appointmentDtoList = new List<AppointmentDto>();

        var connectionString = _configuration.GetConnectionString("MySqlConnection");

        using (var connection = new MySqlConnection(connectionString))
        {
            await connection.OpenAsync();

            string selectQuery = @"SELECT t.*, p.name AS partyroomName
                                    FROM timeslots t
                                    INNER JOIN partyrooms p ON p.id = t.partyroomId
                                    WHERE t.userId = @userId
                                    AND (DATE_ADD(t.create_time, INTERVAL 15 MINUTE) >= NOW() OR confirm = 1)
                                    AND (t.date > CURDATE() OR (t.date = CURDATE() AND t.end_time >= CURTIME()))
                                    ORDER BY t.date ASC, t.start_time ASC;";

            using (var command = new MySqlCommand(selectQuery, connection))
            {
                command.Parameters.AddWithValue("@UserId", userId);

                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (reader.Read())
                    {
                        string appointmentId = reader.GetString("id");
                        string partyroomId = reader.GetString("partyroomId");
                        string partyroomName = reader.GetString("partyroomName");
                        string date = reader.GetDateTime("date").ToString("yyyy-MM-dd");
                        string startTime = reader.GetTimeSpan("start_time").ToString(@"hh\:mm");
                        string endTime = reader.GetTimeSpan("end_time").ToString(@"hh\:mm");
                        bool confirm = reader.GetBoolean("confirm");

                        AppointmentDto existingAppointment = appointmentDtoList.FirstOrDefault(appointment => appointment.PartyRoomId == partyroomId);

                        if (existingAppointment == null)
                        {
                            AppointmentDto appointmentDto = new AppointmentDto
                            {
                                PartyRoomId = partyroomId,
                                PartyRoomName = partyroomName,
                                Timeslots = new List<Timeslot>
                                {
                                    new Timeslot
                                    {
                                        AppointmentId = appointmentId,
                                        Date = date,
                                        StartTime = startTime,
                                        EndTime = endTime,
                                        Confirm = confirm,
                                    }
                                }
                            };

                            appointmentDtoList.Add(appointmentDto);
                        }
                        else
                        {
                            existingAppointment.Timeslots.Add(new Timeslot
                            {
                                AppointmentId = appointmentId,
                                Date = date,
                                StartTime = startTime,
                                EndTime = endTime,
                                Confirm = confirm,
                            });
                        }


                    }
                }
            }

            connection.Close();
        }

        return Ok(appointmentDtoList);
    }

    [HttpPost("detail")]
    public async Task<IActionResult> Detail([FromBody] dynamic partyRoomId)
    {
        try
        {
            string id = partyRoomId.GetProperty("id").GetString();
            if (id == "") return BadRequest("No id found");

            PartyRoomDto partyRoomDto = null;
            var connectionString = _configuration.GetConnectionString("MySqlConnection");

            using (var connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();

                string selectQuery = @"SELECT * FROM partyrooms WHERE id = @id ";

                using (var command = new MySqlCommand(selectQuery, connection))
                {
                    command.Parameters.AddWithValue("@id", id);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (reader.Read())
                        {
                            string roomId = reader.GetString("id");
                            string partyRoomName = reader.GetString("name");
                            string partyRoomLocation = reader.GetString("location");
                            string partyRoomDescription = reader.GetString("description");

                            partyRoomDto = new PartyRoomDto
                            {
                                PartyRoomId = roomId,
                                Name = partyRoomName,
                                Location = partyRoomLocation,
                                Description = partyRoomDescription
                            };

                        }
                    }
                }

                connection.Close();
            }
            if (partyRoomDto == null) return BadRequest("No such party room");
            return Ok(partyRoomDto);

        }
        catch (Exception)
        {
            return BadRequest("An error occurred during Party Room Search.");
        }
    }

    [HttpPost("buttondisable")]
    public async Task<IActionResult> Buttondisable([FromBody] dynamic partyRoomData)
    {
        try
        {
            string id = partyRoomData.GetProperty("partyRoomId").GetString();
            string date = partyRoomData.GetProperty("date").GetString();
            if (id == "") return BadRequest("No id found");

            var connectionString = _configuration.GetConnectionString("MySqlConnection");

            using (var connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();

                string selectQuery = @"SELECT COUNT(*) AS count
                                        FROM timeslots
                                        WHERE partyroomId = @id
                                        AND date = @SearchDate
                                        AND (create_time + INTERVAL 15 MINUTE >= NOW() OR confirm = 1)";

                using (var command = new MySqlCommand(selectQuery, connection))
                {
                    command.Parameters.AddWithValue("@id", id);
                    command.Parameters.AddWithValue("@SearchDate", date);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (reader.Read())
                        {
                            int count = reader.GetInt32("count");
                            if (count >= 24) return Ok(true);

                            return Ok(false);
                        }
                    }
                }
                connection.Close();
            }
            return BadRequest("An error occurred during Party Room Button Disable check.");
        }
        catch (Exception)
        {
            return BadRequest("An error occurred during Party Room Button Disable check.");
        }
    }

    [HttpPost("checkboxdisable")]
    public async Task<IActionResult> Checkboxdisable([FromBody] dynamic partyRoomCheckboxData)
    {
        try
        {
            string id = partyRoomCheckboxData.GetProperty("partyRoomId").GetString();
            string date = partyRoomCheckboxData.GetProperty("selectedDate").GetString();
            string startTime = partyRoomCheckboxData.GetProperty("startTime").GetString();
            if (id == "") return BadRequest("No id found");

            var connectionString = _configuration.GetConnectionString("MySqlConnection");

            using (var connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();

                string selectQuery = @"SELECT COUNT(*) AS count
                                        FROM timeslots
                                        WHERE start_time = @StartTime
                                        AND partyroomId = @id
                                        AND date = @SearchDate
                                        AND (create_time + INTERVAL 15 MINUTE >= NOW() OR confirm = 1)";

                using (var command = new MySqlCommand(selectQuery, connection))
                {
                    command.Parameters.AddWithValue("@id", id);
                    command.Parameters.AddWithValue("@SearchDate", date);
                    command.Parameters.AddWithValue("@StartTime", startTime);

                    int count = Convert.ToInt32(command.ExecuteScalar());

                    if (count >= 1)
                    {
                        return Ok(true);
                    }
                    else
                    {
                        return Ok(false);
                    }
                }
                connection.Close();
            }
            return BadRequest("An error occurred during Party Room Checkbox Disable check.");
        }
        catch (Exception)
        {
            return BadRequest("An error occurred during Party Room Checkbox Disable check.");
        }
    }

    [HttpPost("booking")]
    public async Task<IActionResult> Booking([FromBody] dynamic bookingDetail)
    {
        try
        {
            string partyRoomId = bookingDetail.GetProperty("partyRoomId").GetString();
            string userId = bookingDetail.GetProperty("userId").GetString();
            string selectedDate = bookingDetail.GetProperty("selectedDate").GetString();
            JsonElement checkedListElement = bookingDetail.GetProperty("checkedList");
            string checkedList = checkedListElement.ToString();
            if (partyRoomId.IsNullOrEmpty() || userId.IsNullOrEmpty() || checkedList.IsNullOrEmpty()) return BadRequest("No partyRoomId or UserId or Timeslot");

            var connectionString = _configuration.GetConnectionString("MySqlConnection");

            using (var connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();

                string selectQuery = @"SELECT COUNT(*) FROM timeslots WHERE partyroomId = @PartyRoomId AND date = @Date AND 
                                        start_time = @StartTime AND (create_time + INTERVAL 15 MINUTE >= NOW() OR confirm = 1)";

                string insertQuery = "INSERT INTO timeslots (id, partyroomId, date, start_time, end_time, userId, confirm, create_time) " +
                            "VALUES (@Id, @PartyRoomId, @Date, @StartTime, @EndTime, @UserId, 0, NOW())";

                foreach (JsonElement item in checkedListElement.EnumerateArray())
                {
                    string label = item.GetProperty("label").GetString();
                    string startTime = item.GetProperty("startTime").GetString();
                    string endTime = item.GetProperty("endTime").GetString();

                    using (MySqlCommand selectCommand = new MySqlCommand(selectQuery, connection))
                    {
                        selectCommand.Parameters.AddWithValue("@PartyRoomId", partyRoomId);
                        selectCommand.Parameters.AddWithValue("@Date", selectedDate);
                        selectCommand.Parameters.AddWithValue("@StartTime", startTime);

                        int existingBookings = Convert.ToInt32(await selectCommand.ExecuteScalarAsync());
                        if (existingBookings > 0) return BadRequest("One of the timeslots has been booked. Please try again and book a different timeslot.");
                    }
                }

                foreach (JsonElement item in checkedListElement.EnumerateArray())
                {
                    string label = item.GetProperty("label").GetString();
                    string startTime = item.GetProperty("startTime").GetString();
                    string endTime = item.GetProperty("endTime").GetString();

                    using (MySqlCommand insertCommand = new MySqlCommand(insertQuery, connection))
                    {
                        insertCommand.Parameters.AddWithValue("@Id", Guid.NewGuid().ToString());
                        insertCommand.Parameters.AddWithValue("@PartyRoomId", partyRoomId);
                        insertCommand.Parameters.AddWithValue("@Date", selectedDate);
                        insertCommand.Parameters.AddWithValue("@StartTime", startTime);
                        insertCommand.Parameters.AddWithValue("@EndTime", endTime);
                        insertCommand.Parameters.AddWithValue("@UserId", userId);

                        await insertCommand.ExecuteNonQueryAsync();
                    }
                }
                connection.Close();
            }
            return Ok("Booking successful. \n Please confirm your booking in My Appointment in 15 minutes.");
        }
        catch (Exception)
        {
            return BadRequest("An error occurred during booking.");
        }
    }

    [HttpPost("bookingconfirm")]
    public async Task<IActionResult> Bookingconfirm([FromBody] dynamic bookingConfirmDetail)
    {
        try
        {
            string appointmentId = bookingConfirmDetail.GetProperty("appointmentId").GetString();
            string userId = bookingConfirmDetail.GetProperty("userId").GetString();

            if (appointmentId.IsNullOrEmpty() || userId.IsNullOrEmpty()) return BadRequest("AppointmentId or UserId is empty");

            var connectionString = _configuration.GetConnectionString("MySqlConnection");

            using (var connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();

                string selectQuery = @"SELECT COUNT(*) FROM timeslots 
                                        WHERE id = @Id
                                        AND userId = @userId
                                        AND confirm = 0 
                                        AND create_time + INTERVAL 15 MINUTE >= NOW()";

                using (var selectCommand = new MySqlCommand(selectQuery, connection))
                {
                    selectCommand.Parameters.AddWithValue("@Id", appointmentId);
                    selectCommand.Parameters.AddWithValue("@userId", userId);

                    int count = Convert.ToInt32(await selectCommand.ExecuteScalarAsync());
                    if (count == 1)
                    {
                        string updateQuery = @"UPDATE timeslots SET confirm = 1 WHERE id = @Id";

                        using (var updateCommand = new MySqlCommand(updateQuery, connection))
                        {
                            updateCommand.Parameters.AddWithValue("@Id", appointmentId);
                            await updateCommand.ExecuteNonQueryAsync();
                        }
                    }
                    else
                    {
                        return BadRequest("Invalid appointment or 15 minutes confirmation has passed");
                    }
                }
                connection.Close();
            }
            return Ok("Confirmation completed.");
        }
        catch (Exception)
        {
            return BadRequest("An error occurred during booking confirmation.");
        }
    }

    [HttpPost("bookingcancel")]
    public async Task<IActionResult> Bookingcancel([FromBody] dynamic bookingCancelDetail)
    {
        try
        {
            string appointmentId = bookingCancelDetail.GetProperty("appointmentId").GetString();
            string userId = bookingCancelDetail.GetProperty("userId").GetString();

            if (appointmentId.IsNullOrEmpty() || userId.IsNullOrEmpty()) return BadRequest("AppointmentId or UserId is empty");

            var connectionString = _configuration.GetConnectionString("MySqlConnection");

            using (var connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();

                string selectQuery = @"SELECT COUNT(*) FROM timeslots WHERE id = @Id AND userId = @UserId";

                using (var selectCommand = new MySqlCommand(selectQuery, connection))
                {
                    selectCommand.Parameters.AddWithValue("@Id", appointmentId);
                    selectCommand.Parameters.AddWithValue("@userId", userId);

                    int count = Convert.ToInt32(await selectCommand.ExecuteScalarAsync());
                    if (count == 1)
                    {
                        string deleteQuery = @"DELETE FROM timeslots WHERE id = @Id AND userId = @UserId";

                        using (var deleteCommand = new MySqlCommand(deleteQuery, connection))
                        {
                            deleteCommand.Parameters.AddWithValue("@Id", appointmentId);
                            deleteCommand.Parameters.AddWithValue("@UserId", userId);

                            await deleteCommand.ExecuteNonQueryAsync();
                        }
                    }
                    else
                    {
                        return BadRequest("No booking found and cancel failed.");
                    }
                }
                connection.Close();
            }
            return Ok("Booking canceled successfully.");
        }
        catch (Exception)
        {
            return BadRequest("An error occurred during booking cancellation.");
        }
    }
}