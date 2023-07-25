import { LightningElement } from 'lwc';
import jszip from "@salesforce/resourceUrl/jszip";
import { loadScript } from "lightning/platformResourceLoader";
import getData from '@salesforce/apex/GetZipData.getZip';
import saveBlobData from '@salesforce/apex/GetZipData.saveBlob';


export default class ExtractZip extends LightningElement {
    
    fileBlobData
    showButton = false
    
    renderedCallback() {
        loadScript(this, jszip).then(() => {
        });
    }

    base64ToUint8Array(base64String) {
        const binaryString = atob(base64String);
        const length = binaryString.length;
        const uint8Array = new Uint8Array(length);
    
        for (let i = 0; i < length; i++) {
          uint8Array[i] = binaryString.charCodeAt(i);
        }
    
        return uint8Array;
      }

      base64ToBlob(base64String, contentType) {
        // Convert the base64 string to binary data
        const binaryString = window.atob(base64String);
      
        // Create an ArrayBuffer with the binary data
        const arrayBuffer = new ArrayBuffer(binaryString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < binaryString.length; i++) {
          uint8Array[i] = binaryString.charCodeAt(i);
        }
      
        // Create the Blob using the ArrayBuffer and content type
        return new Blob([arrayBuffer], { type: contentType });
      }

      async handleExtract() {
        const contentVersionId = 'your_ContentVersion_Id_here'; // Replace this with the actual ContentVersion record Id.
    
        try {
          // Retrieve the ContentVersion record from Salesforce.
          const contentVersion = await this.getContentVersionRecord();
          console.log('1 >>>',contentVersion)
          this.fileBlobData = contentVersion;
          var zipInstance = new JSZip();
          console.log('2 >>>',zipInstance)
          const arrayBuffer = await this.base64ToUint8Array(contentVersion);
        //  this.fileBlobData = this.base64ToBlob(contentVersion,"application/zip")
          console.log('3 >>>',this.fileBlobData)
          this.showButton = true
          zipInstance.loadAsync(arrayBuffer).then(function (zip) {
            Object.keys(zip.files).forEach(function (filename) {
              zip.files[filename].async('blob').then(function (fileData) {
                 
                const link = document.createElement('a');
                link.href = URL.createObjectURL(fileData);
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log(fileData) // These are your file contents   
                   
              })
            })
          })
       
          //console.log('3 >>>',zip)

        } catch (error) {
          console.error('Error extracting ZIP archive:', error);
        }
      }
    
      // Function to retrieve the ContentVersion record from Salesforce.
      getContentVersionRecord() {
        return new Promise((resolve, reject) => {
            getData()
            .then((result) => {
              resolve(result);
            })
            .catch((error) => {
              reject(error);
            });
        });
      }

      saveBlob(event){
        saveBlobData({data: this.fileBlobData})
            .then((result) => {
                console.log('blob is saved')
            })
            .catch((error) => {
              console.log('error in saving blob',error)
            });
      }

      
}