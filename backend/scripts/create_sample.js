const xlsx = require('xlsx');

const data = [
    { Description: 'Semen 50kg', Quantity: 10, Unit: 'zak' },
    { Description: 'Pasir', Quantity: 5, Unit: 'm3' },
    { Description: 'Batu Bata', Quantity: 1000, Unit: 'pcs' },
    { Description: 'Cat Tembok Putih', Quantity: 2, Unit: 'pail' }
];

const ws = xlsx.utils.json_to_sheet(data);
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, "Sheet1");

xlsx.writeFile(wb, '../sample_import.xlsx');
console.log('Sample Excel file created at ../sample_import.xlsx');
