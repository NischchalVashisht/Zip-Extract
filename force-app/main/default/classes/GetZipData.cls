public with sharing class GetZipData {
    @AuraEnabled
    public static String getZip(){
        try {
            Contentversion cv = [Select Title ,VersionData from Contentversion where title = '10th' limit 1];
          //  String tempData = cv.VersionData;
            return EncodingUtil.base64Encode(cv.VersionData);
            
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @future
    public static void saveFile(){
        try {
            System.debug('1');
            Contentversion cv = [Select Title ,VersionData from Contentversion where title = '10th' limit 1];
           // Blob blobData = EncodingUtil.base64Decode(cv.VersionData);
            Zippex zip =new Zippex(cv.VersionData);
            System.debug('3');
            List<Contentversion > cvInsert = new List<Contentversion>();
            System.debug('4');
            for(String name: zip.getFileNames()){
                System.debug('5');
                Contentversion cvTmp = new Contentversion();
                cvTmp.VersionData = zip.getFile(name);
                cvTmp.title = 'ZipClone1';
                cvTmp.pathOnClient =   'ZipClone1';
                cvInsert.add(cvTmp);
                System.debug('6');
            }
            if(cvInsert.size()>0){
                System.debug('7');
                insert cvInsert;
            }
        } catch (Exception e) {
            system.debug('Exception '+e);
        }
    }
    

    @AuraEnabled
    public static void saveBlob(String data){
        try {
            saveFile();
        } catch (Exception e) {
            system.debug('Exception '+e);
            throw new AuraHandledException(e.getMessage());
        }
    }
}