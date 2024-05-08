export const userInputs = [
  {
    id: "idNum",
    label:"ID Number",
    type:"text",
    placeholder: "00-0000-000",
    pattern:"[0-9]{2}-[0-9]{4}-[0-9]{3}",
  },
  {
    id: "firstName",
    label:"First Name",
    type:"text",
    placeholder: "First Name",
  },
  {
    id: "lastName",
    label:"Last Name",
    type:"text",
    placeholder: "Last Name",
  },
  {
    id: "email",
    label:"School Email",
    type:"email",
    placeholder: "example@cit.edu",
  },
  {
    id: "department",
    label:"Department",
    type:"text",
    placeholder: "eg. CCS",
  },
  {
    id: "role",
    label:"Role",
    type:"dropdown", // Change the type to "dropdown"
    options: ["Student", "Faculty", "Admin"], // Add options for the dropdown
  },
  {
    id: "password",
    label:"Password",
    type:"password",
    placeholder: "********",
  },
]

export const classInputs= [
  {
    id: "classCode",
    label:"Class Code",
    type:"text",
    placeholder: "eg. CSIT000",
  },
  {
    id: "classDesc",
    label:"Course Description",
    type:"text",
    placeholder: "eg. Programming 1",
  },
  {
    id: "classSec",
    label:"Class Section",
    type:"text",
    placeholder: "eg. F0/G0",
  },
  // {
  //   id: "instructor",
  //   label:"Instructor",
  //   type:"text",
  //   placeholder: "eg. Firstname Lastname",
  // },
  {
    id: "classRoom",
    label:"Classroom",
    type:"text",
    placeholder: "eg. GLE, NGE, etc.",
  },
  {
    id: "classType",
    label:"Type of Class",
    type:"dropdown", // Change the type to "dropdown"
    options: ["Lecture", "Lab"], // Add options for the dropdown
  },
   {
     id: "days",
     label:"Day/s of the Week",
     type:"text",
     placeholder: "eg. Monday, Tuesday, Wednesday, etc.",
   },
  {
    id: "startTime",
    label:"Start Time",
    type:"time",
    placeholder: "Start Time",
  },
  {
    id: "endTime",
    label:"End Time",
    type:"time",
    placeholder: "End Time",
  },
  {
    id: "schoolYear",
    label:"School Year",
    type:"text",
    placeholder: "eg.2324, etc.",
    pattern: "[0-9]{4}",
  },
  {
    id: "semester",
    label:"Semester",
    type:"dropdown", // Change the type to "dropdown"
    options: ["First", "Second", "Midyear"], // Add options for the dropdown
  },
]

export const roomInputs = [
  {
    id: "roomNum",
    label:"Room Number",
    type:"text",
    placeholder: "eg. 101, 102, 103, etc.",
    pattern: "[0-9]{3}",
  },
  {
    id: "building",
    label:"Building",
    type:"text",
    placeholder: "eg. NGE, GLE, etc.",
  },
  {
    id: "capacity",
    label:"Capacity",
    type:"number",
    min: "1",
    max: "70",
  },
  {
    id: "length",
    label:"Length",
    type:"number",
    min: "1",
    max: "1000",
  },
  {
    id: "width",
    label:"Width",
    type:"number",
    min: "1",
    max: "1000",
  },
  {
    id: "height",
    label:"Height",
    type:"number",
    min: "1",
    max: "1000",
  },
  {
    id: "location",
    label:"Location",
    type:"text",
    placeholder: "Geopoint",
  },
  {
    id: "powerSource",
    label:"Power Source",
    type:"text",
    placeholder: "Power Source",
  },
  {
    id: "occupancyStatus",
    label:"Occupancy Status",
    placeholder: "Active/Inactive",
    type:"dropdown", 
    options: ["Inactive", "Active"],
  },
]

export const accessPointInputs = [
  {
    id: "location",
    label:"Location",
    type:"text",
    placeholder: "Geopoint",
  },
  {
    id: "signalStr",
    label:"Capacity",
    type:"number",
    min: "1",
    max: "70",
  },
  {
    id: "macAddress",
    label:"MAC Address",
    type:"text",
    placeholder: "MAC Address",
  },
  {
    id: "status",
    label:"Status",
    placeholder: "Active/Inactive",
    type:"dropdown", 
    options: ["Inactive", "Active"],
  },
]
