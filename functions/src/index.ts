// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

import * as functions from 'firebase-functions';

// Firebase
import * as admin from 'firebase-admin';
admin.initializeApp();

// Cloud Vision
//import * as vision from '@google-cloud/vision';

const vision = require('@google-cloud/vision');
const visionClient = new vision.ImageAnnotatorClient();


// Dedicated bucket for cloud function invocation
const bucketName = 'hotdogorlegsbucket';

export const imageTagger = functions.storage
    .bucket(bucketName)
    .object()
    .onFinalize(async (object, context) => {

        const filePath = object.name ? object.name : 'no_name';

        // Location of saved file in bucket
        const imageUri = `gs://${bucketName}/${filePath}`;

        const id = filePath.split('.jpg')[0];

        const docRef = admin.firestore().collection('photos').doc(id);

        // Await the cloud vision response
        const results = await visionClient.labelDetection(imageUri);

        // Map the data to desired format
        const labels = results[0].labelAnnotations.map((obj: { description: any; }) => obj.description);
        const hotdog = labels.includes('hot dog')

        return docRef.set({ id, hotdog, labels })
    });