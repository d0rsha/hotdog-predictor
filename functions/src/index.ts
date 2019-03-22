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

        let hotdog = false;

        const a2: Array<string> = ['vienna sausage', 'falukorv', 'sausage', 'bratwurst', 'varmkorv',];
        hotdog = labels.some((v: { toLowerCase: () => string; }) => {
            let b = false;

            a2.forEach(element => {
                if (element.toLowerCase().includes(v.toLowerCase())) {
                    b = true;
                }
            });
            return b;
        }
        );




        const hots = labels.filter((word: { toLowerCase: () => { includes: (arg0: string) => void; }; }) => word.toLowerCase().includes('hot'));
        const dogs = labels.filter((word: { toLowerCase: () => { includes: (arg0: string) => void; }; }) => word.toLowerCase().includes('dog'));
        const matches = Array<string>();

        hots.forEach((e1: string) => dogs.forEach((e2: string) => {
            {
                if (e1 === e2) {
                    matches.push(e1);
                }
            }
        }));

        if (matches.length > 0) {
            hotdog = true;
        }


        return docRef.set({ id, matches, hotdog, labels })
    });

