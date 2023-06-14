import axios from 'axios';


export async function GenerateMap(latitude, longitude) {
    try {
        const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap?';
        const url = `${baseUrl}center=${latitude},${longitude}&zoom=14&size=500x400&scale=1&maptype=hybrid&markers=size:mid%7Ccolor:red%7C${latitude},${longitude}&key=${process.env.MAPS_KEY}`;
        const response = await axios.get(url, {
            responseType: 'arraybuffer'
        });
        const base64Image = Buffer.from(response.data, 'binary').toString(('base64'));
        return 'data:image/png;base64,' + base64Image;
    } catch (err) {
        console.log(err);
        return '';
    }
}
