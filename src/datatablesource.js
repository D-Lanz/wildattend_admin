export const userColumns = [
  { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'user', headerName: 'User', width: 230, renderCell:(params)=>{
        return(
          <div className="cellWithImg">
            <img className="cellImg" src={params.row.img} alt="avatar"/>
            {params.row.lastName} {params.row.firstName}
          </div>
        );
    },
  },
  { field: 'idNum', headerName: 'ID Number', width: 130, },
  { field: 'email', headerName: 'School Email', width: 230, },
  { field: 'role', headerName: 'Role', width: 130, },
];

//temporary data
export const userRows = [
  {
    id: 1,
    idNum: "123-456",
    email:'arataki.itto@cit.edu',
    img: 'https://img.game8.co/3457893/4e1145280836f6e662e64ebb9a68e646.png/show',
    lastName: 'Arataki',
    firstName: 'Itto',
    role:'Student',
  },
  {
    id: 2,
    idNum: "789-101",
    email: 'kaedehara.kazuha@cit.edu',
    img: 'https://img.game8.co/3378026/242362114b92f3e00ee1d72355e6870f.png/show',
    lastName: 'Kaedehara',
    firstName: 'Kazuha',
    role:'Student',
  },
  {
    id: 3,
    idNum: "112-131",
    email: 'kamisato.ayaka@cit.edu',
    img: 'https://img.game8.co/3313080/2cae7dd671c21d14eff9fdd945e07da2.png/show',
    lastName: 'Kamisato',
    firstName: 'Ayaka',
    role:'Student',
  },
  {
    id: 4,
    idNum: "415-161",
    email: 'kamisato.ayato@cit.edu',
    img: 'https://img.game8.co/3507977/f539f685858f47fae42a57cf6bfbe634.png/show',
    lastName: 'Kamisato',
    firstName: 'Ayata',
    role:'Faculty',
  },
  {
    id: 5,
    idNum: "718-192",
    email: 'kujou.sara@cit.edu',
    img: 'https://img.game8.co/3410417/af76885ff6366f245127fb47105dda8d.png/show',
    lastName: 'Kujou',
    firstName: 'Sara',
    role:'Faculty',
  },
  {
    id: 6,
    idNum: "212-232",
    email: 'kuki.shinobu@cit.edu',
    img: 'https://img.game8.co/3539169/6dc2b1ce3d5bb8fe449d38c4416b2de4.png/show',
    lastName: 'Kuki',
    firstName: 'Shinobu',
    role:'Student',
  },
  {
    id: 7,
    idNum: "425-262",
    email: 'raiden.shogun@cit.edu',
    img: 'https://img.game8.co/3409293/af58e7854a4e7f7d1d857c5a79db2ce6.png/show',
    lastName: 'Raiden',
    firstName: 'Shogun',
    role:'Faculty',
  },
  {
    id: 8,
    idNum: "728-293",
    email: 'sangonomiya.kokomi@cit.edu',
    img: 'https://img.game8.co/3418180/265e263d98a3461d6091e3cf69ca5fc9.png/show',
    lastName: 'Sangonomiya',
    firstName: 'Kokomi',
    role:'Faculty',
  },
  {
    id: 9,
    idNum: "313-233",
    email: 'shikanoin.heizou@cit.edu',
    img: 'https://img.game8.co/3546223/98ea7f23e9af8bef07385f930ecd073c.png/show',
    lastName:'Shikanoin',
    firstName: 'Heizou',
    role:'Student',
  },
  {
    id: 10,
    idNum: "343-536",
    email: 'yae.miko@cit.edu',
    img: 'https://img.game8.co/3485121/17912d280f92eb096f2fc019d6292b98.png/show',
    lastName:'Miko',
    firstName: 'Yae',
    role:'Faculty',
  },
];