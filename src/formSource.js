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