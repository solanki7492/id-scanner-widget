<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ID Scanner Widget Demo</title>
  <script src="/widget/idscan.js"></script>
  <style>
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #f5f5f5;
      }

      .demo-container {
        max-width: 800px;
        margin: 40px auto;
        padding: 0 20px;
      }

      .demo-header {
        background: white;
        padding: 32px;
        border-radius: 12px;
        margin-bottom: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .demo-header h1 {
        margin: 0 0 8px 0;
        font-size: 28px;
        color: #1f2937;
      }

      .demo-header p {
        margin: 0;
        color: #6b7280;
        font-size: 16px;
      }

      .demo-form {
        background: white;
        padding: 32px;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .form-group {
        margin-bottom: 24px;
      }

      .form-label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #374151;
        font-size: 14px;
      }

      .form-input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        box-sizing: border-box;
      }

      .form-input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      /* Widget container in form context */
      #idscan {
        margin-bottom: 24px;
      }

      .demo-note {
        margin-top: 16px;
        padding: 12px;
        background: #f0f9ff;
        border-left: 3px solid #3b82f6;
        border-radius: 4px;
        font-size: 14px;
        color: #1e40af;
      }
  </style>
</head>
<body>
  <div class="demo-container">
    <div class="demo-header">
      <h1>KYC Verification Form</h1>
      <p>Complete your identity verification</p>
    </div>

    <div class="demo-form">
      <div class="form-group">
        <label class="form-label">Full Name</label>
        <input type="text" class="form-input" placeholder="Enter your full name" />
      </div>

      <div class="form-group">
        <label class="form-label">Email Address</label>
        <input type="email" class="form-input" placeholder="you@example.com" />
      </div>

      <div class="form-group">
        <label class="form-label">Identity Document</label>
        <div id="idscan"></div>
        <div class="demo-note">
          <strong>Note:</strong> This widget is fully self-contained with no styling conflicts. 
          It naturally fits into any form layout.
        </div>
      </div>
    </div>
  </div>

  <script>
    // Simple one-line embed - widget is production-ready
    IdScan.mount("#idscan", { token: "test" });
  </script>
</body>
</html>