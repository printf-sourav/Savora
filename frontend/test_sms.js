import axios from "axios";
(async () => {
try {
  const result = await axios.post("https://www.fast2sms.com/dev/bulkV2", {
      route: "q",
      message: "Test message",
      language: "english",
      flash: 0,
      numbers: "9999999999"
  }, {
      headers: {
          authorization: "itcqMlgsObTRXUaJxK6Bz1wn3Fm0d2uCQS8jL9PWhp5Z4AYDyNe1VRsuU0ylTx6t9mWF8JpQigcSdCD5",
          "Content-Type": "application/json"
      }
  });
  console.log(result.data);
} catch (e) {
  console.error(e.response ? e.response.status : e.message);
  console.error(e.response ? e.response.data : '');
}
})();
