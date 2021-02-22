import React from "react";

function EventTable(props) {

    const [events, setEvents] = React.useState(null);

    React.useState(() => {
        setEvents(props.events);
    }, [props.events])

    return (
        <div>

            {events && events.map((item, key) => (
                <li key={key}>
                    {item.eventDate}
                </li>
            )) }
        </div>
    );
}

export default EventTable;
