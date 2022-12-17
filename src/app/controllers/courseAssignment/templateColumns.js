const buildingsColumns = [
  {
    header: 'CAMPUS',
    key: 'CAMPUS',
    width: 40,
  },
  {
    header: 'BUILDING NAME',
    key: 'BUILDING-NAME',
    width: 40,
  },
  {
    header: 'BUILDING DESCRIPTION',
    key: 'BUILDING-DESCRIPTION',
    width: 40,
  },
];

const roomsColumns = [
  {
    header: 'BUILDING',
    key: 'BUILDING',
    width: 40,
  },
  {
    header: 'ROOM TAG',
    key: 'ROOM-TAG',
    width: 40,
  },
  {
    header: 'ROOM CODE',
    key: 'ROOM-CODE',
    width: 20,
  },
  {
    header: 'ROOM CAPACITY',
    key: 'ROOM-CAPACITY',
    width: 20,
  },
];

module.exports = {
  buildingsColumns,
  roomsColumns,
};
