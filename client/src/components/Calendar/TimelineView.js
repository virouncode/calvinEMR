//Librairies
import React from "react";
import FullCalendar from "@fullcalendar/react"; // must go before plugins
import interaction from "@fullcalendar/interaction";
import resourceTimeline from "@fullcalendar/resource-timeline";
//Utils
import { rooms } from "../../utils/rooms";

const TimelineView = ({
  slotDuration,
  firstDay,
  fcRef,
  events,
  isSecretary,
  handleDatesSet,
  handleEventClick,
  handleDateSelect,
  handleDragStart,
  handleDrop,
  handleResize,
  handleResizeStart,
  renderEventContent,
}) => {
  return (
    <FullCalendar
      plugins={[resourceTimeline, interaction]}
      //===================Design=====================//
      headerToolbar={{
        start: "title",
        center:
          "resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth",
        end: "prev today next",
      }}
      slotLabelFormat={{
        hour: "numeric",
        minute: "2-digit",
        omitZeroMinute: true,
        meridiem: "short",
      }}
      buttonText={{
        today: "Today",
        month: "Month",
        week: "Week",
        day: "Day",
      }}
      views={{
        resourceTimelineDay: {
          slotLabelFormat: [
            { weekday: "long" },
            { hour: "numeric", omitZeroMinute: true, meridiem: "short" },
          ],
        },
        resourceTimelineMonth: {
          slotDuration: "24:00",
          slotLabelInterval: "24:00",
          slotLabelFormat: { day: "numeric", weekday: "short" },
        },
        resourceTimelineWeek: {
          slotDuration: "00:30",
          slotLabelFormat: [
            {
              day: "numeric",
              weekday: "short",
              month: "short",
            },
            {
              hour: "numeric",
              minute: "2-digit",
              omitZeroMinute: true,
              meridiem: "short",
            },
          ],
        },
      }}
      resourceAreaHeaderContent="Rooms"
      resourceAreaWidth="10%"
      initialView="resourceTimelineDay"
      slotDuration={slotDuration}
      firstDay={firstDay}
      weekNumbers={true}
      nowIndicator={true}
      eventTextColor="#FEFEFE"
      eventColor={isSecretary() ? "#bfbfbf" : "#40A8F5"}
      slotLabelInterval="01:00"
      navLinks={true}
      navLinkDayClick="timeGrid"
      weekText="Week"
      aspectRatio="2"
      expandRows={true}
      eventMinWidth="5"
      //==================== INTERACTION ====================//
      selectable={true}
      selectMirror={true}
      eventResizableFromStart={true}
      editable={true}
      unselectAuto={false}
      allDayMaintainDuration={true}
      ref={fcRef}
      //==================== CALLBACKS ====================//
      resources={rooms.map((room) => {
        return { id: room.id, title: room.title };
      })}
      events={events}
      datesSet={handleDatesSet}
      eventClick={handleEventClick}
      select={handleDateSelect}
      eventDragStart={handleDragStart}
      eventDrop={handleDrop}
      eventResize={handleResize}
      eventResizeStart={handleResizeStart}
      //====================== EVENT STYLING =================//
      eventContent={renderEventContent}
      eventClassNames={function (arg) {
        return `event-${arg.event.id}`;
      }}
    />
  );
};

export default TimelineView;