<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="/widget/idscan.js"></script>
  <style>
      body { margin:0; background:#000; }

      #idscan-root {
        position: relative;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
      }

      video, canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      #idscan-placeholder {
        width: 100vw;
        height: 100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        background:#111;
      }

      #idscan-start {
        padding: 16px 24px;
        font-size: 18px;
        border-radius: 8px;
        background: #00ff99;
        border: none;
        cursor: pointer;
      }

      #idscan-hint {
        position:absolute;
        bottom:24px;
        width:100%;
        text-align:center;
        color:#00ff99;
        font-weight:600;
      }
  </style>
</head>
<body>
  <div id="idscan"></div>

  <script>
    IdScan.mount("#idscan", { token: "test_token" });
  </script>
</body>
</html>