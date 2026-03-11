const str = Buffer.from('aW52aXRpbmctcmluZ3RhaWwtMzEuY2xlcmsuYWNjb3VudHMuZGV2JA', 'base64').toString('utf8');
console.log('Com JA:', str);
const str2 = Buffer.from('aW52aXRpbmctcmluZ3RhaWwtMzEuY2xlcmsuYWNjb3VudHMuZGV2', 'base64').toString('utf8');
console.log('Sem JA:', str2);
