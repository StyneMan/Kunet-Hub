import axios from 'axios';

export default async function calculateDistance(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
): Promise<number> {
  const mapAPIKey = process.env.GOOGLE_MAP_API_KEY ?? '';
  const orig = `${origin?.lat}, ${origin?.lng}`;
  const dest = `${destination?.lat}, ${destination?.lng}`;

  console.log('ORIGIN :: ', orig);
  console.log('DESTINATIONO :: ', dest);

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${orig}&destinations=${dest}&key=${mapAPIKey}`;

  const response = await axios.get(url);
  const result = response.data;

  let deliveryDistance = 0;
  // let deliveryTime = '';

  console.log('dIST CALCULATOR RESULT ::: ', result.rows[0].elements[0]);

  for (let index = 0; index < result?.rows?.length; index++) {
    const element = result?.rows[index];
    console.log('DELIVERY INFO ::: ', element?.elements);
    if (`${element?.elements[0]?.status}`.includes('ZERO_RESULTS')) {
      // use default vaalue. GCP API ISSUE
      console.log('DELIVERY DISTANCE ::: ', 10);
      console.log('DELIVERY DURATION ::: ', 10);
      // deliveryTime = '1hr';
      deliveryDistance = 10000;
    } else {
      console.log('DELIVERY DISTANCE ::: ', element?.elements[0]?.distance);
      console.log('DELIVERY DURATION ::: ', element?.elements[0]?.duration);
      // deliveryTime = element?.elements[0]?. ?.text;
      deliveryDistance = element?.elements[0]?.distance?.value;
    }
  }

  return deliveryDistance / 1000; // Convert to km
}
