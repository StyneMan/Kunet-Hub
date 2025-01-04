import { UserType } from 'src/enums/user.type.enum';
import { OnboardingDTO } from './onboarding.dto';

export function verificationEmailContent(code: any, firstname: string): string {
  return `<body
  class="clean-body u_body"
  style="
    margin: 0;
    padding: 0;
    -webkit-text-size-adjust: 100%;
    background-color: rgba(255, 216, 166, 0.22);
    color: #000000;
  "
>
  <table
    id="u_body"
    style="
      border-collapse: collapse;
      table-layout: fixed;
      border-spacing: 0;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      vertical-align: top;
      min-width: 320px;
      margin: 0 auto;
      background-color: #f9f9f9;
      width: 100%;
    "
    cellpadding="0"
    cellspacing="0"
  >
    <tbody>
      <tr style="vertical-align: top">
        <td
          style="
            word-break: break-word;
            border-collapse: collapse !important;
            vertical-align: top;
          "
        >
          <div
            class="u-row-container"
            style="padding: 0px; background-color: transparent"
          >
            <div
              class="u-row"
              style="
                margin: 0 auto;
                min-width: 320px;
                max-width: 600px;
                overflow-wrap: break-word;
                word-wrap: break-word;
                word-break: break-word;
                background-color: rgba(255, 235, 209, 1);
              "
            >
              <div
                style="
                  border-collapse: collapse;
                  display: table;
                  width: 100%;
                  height: 100%;
                  background-color: transparent;
                "
              >
                <div
                  class="u-col u-col-100"
                  style="
                    max-width: 320px;
                    min-width: 600px;
                    display: table-cell;
                    vertical-align: top;
                  "
                >
                  <div style="height: 100%; width: 100% !important">
                    <div
                      style="
                        box-sizing: border-box;
                        height: 100%;
                        padding: 0px;
                        border-top: 0px solid transparent;
                        border-left: 0px solid transparent;
                        border-right: 0px solid transparent;
                        border-bottom: 0px solid transparent;
                      "
                    >
                      <table
                        style="font-family: 'Cabin', sans-serif"
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        border="0"
                      >
                        <tbody>
                          <tr>
                            <td
                              style="
                                overflow-wrap: break-word;
                                word-break: break-word;
                                padding: 20px;
                                font-family: 'Cabin', sans-serif;
                              "
                              align="left"
                            >
                              <table
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                              >
                                <tr>
                                  <td
                                    style="
                                      padding-right: 0px;
                                      padding-left: 0px;
                                    "
                                    align="center"
                                  >
                                    <div
                                      style="
                                        display: flex;
                                        flex-direction: row;
                                        justify-content: center;
                                        align-items: center;
                                      "
                                    >
                                      <img
                                        align="center"
                                        border="0"
                                        src="https://i.imgur.com/C5fgW4m.png"
                                        alt="Image"
                                        title="Image"
                                        style="
                                          outline: none;
                                          text-decoration: none;
                                          -ms-interpolation-mode: bicubic;
                                          clear: both;
                                          display: inline-block !important;
                                          border: none;
                                          height: auto;
                                          float: none;
                                          width: 30%;
                                          max-width: 140px;
                                        "
                                        width="140.0"
                                      />
                                    </div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="u-row-container"
            style="padding: 0px; background-color: transparent"
          >
            <div
              class="u-row"
              style="
                margin: 0 auto;
                min-width: 320px;
                max-width: 600px;
                overflow-wrap: break-word;
                word-wrap: break-word;
                word-break: break-word;
                background-color: #f7941d;
              "
            >
              <div
                style="
                  border-collapse: collapse;
                  display: table;
                  width: 100%;
                  height: 100%;
                  background-color: transparent;
                "
              >
                <div
                  class="u-col u-col-100"
                  style="
                    max-width: 320px;
                    min-width: 600px;
                    display: table-cell;
                    vertical-align: top;
                  "
                >
                  <div style="height: 100%; width: 100% !important">
                    <div
                      style="
                        box-sizing: border-box;
                        height: 100%;
                        padding: 0px;
                        border-top: 0px solid transparent;
                        border-left: 0px solid transparent;
                        border-right: 0px solid transparent;
                        border-bottom: 0px solid transparent;
                      "
                    >
                      <table
                        style="font-family: 'Cabin', sans-serif"
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        border="0"
                      >
                        <tbody>
                          <tr>
                            <td
                              style="
                                overflow-wrap: break-word;
                                word-break: break-word;
                                padding: 0px 10px 31px;
                                font-family: 'Cabin', sans-serif;
                              "
                              align="left"
                            >
                              <div
                                style="
                                  color: #fff;
                                  line-height: 140%;
                                  text-align: center;
                                  word-wrap: break-word;
                                "
                              >
                                <br />
                                <p style="font-size: 14px; line-height: 140%">
                                  <span
                                    style="font-size: 28px; line-height: 39.2px"
                                    ><strong
                                      ><span
                                        style="
                                          line-height: 39.2px;
                                          font-size: 28px;
                                        "
                                        >ACCOUNT VERIFICATION</span
                                      ></strong
                                    >
                                  </span>
                                </p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="u-row-container"
            style="padding: 0px; background-color: transparent"
          >
            <div
              class="u-row"
              style="
                margin: 0 auto;
                min-width: 320px;
                max-width: 600px;
                overflow-wrap: break-word;
                word-wrap: break-word;
                word-break: break-word;
                background-color: rgba(255, 235, 209, 1);
              "
            >
              <div
                style="
                  border-collapse: collapse;
                  display: table;
                  width: 100%;
                  height: 100%;
                  background-color: transparent;
                "
              >
                <div
                  class="u-col u-col-100"
                  style="
                    max-width: 320px;
                    min-width: 600px;
                    display: table-cell;
                    vertical-align: top;
                  "
                >
                  <div style="height: 100%; width: 100% !important">
                    <div
                      style="
                        box-sizing: border-box;
                        height: 100%;
                        padding: 0px;
                        border-top: 0px solid transparent;
                        border-left: 0px solid transparent;
                        border-right: 0px solid transparent;
                        border-bottom: 0px solid transparent;
                      "
                    >
                      <table
                        style="font-family: 'Cabin', sans-serif"
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        border="0"
                      >
                        <tbody>
                          <tr>
                            <td
                              style="
                                overflow-wrap: break-word;
                                word-break: break-word;
                                padding: 33px 55px;
                                font-family: 'Cabin', sans-serif;
                              "
                              align="left"
                            >
                              <div
                                style="
                                  line-height: 160%;
                                  text-align: center;
                                  word-wrap: break-word;
                                "
                              >
                                <p style="font-size: 14px; line-height: 160%">
                                  <span
                                    style="
                                      font-size: 22px;
                                      line-height: 35.2px;
                                      color: #4b2e20;
                                    "
                                    >${'Hi ' + firstname}
                                  </span>
                                </p>
                                <p style="font-size: 14px; line-height: 160%">
                                  <span
                                    style="font-size: 18px; line-height: 28.8px"
                                    >You're almost ready to get started. Please
                                    use the code below to verify your account
                                    and enjoy our platform!
                                  </span>
                                </p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table
                        style="font-family: 'Cabin', sans-serif"
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        border="0"
                      >
                        <tbody>
                          <tr>
                            <td
                              style="
                                overflow-wrap: break-word;
                                word-break: break-word;
                                padding: 10px;
                                font-family: 'Cabin', sans-serif;
                              "
                              align="left"
                            >
                              <div align="center">
                                <a
                                  href=""
                                  target="_self"
                                  class="v-button"
                                  style="
                                    box-sizing: border-box;
                                    display: inline-block;
                                    font-family: 'Cabin', sans-serif;
                                    text-decoration: none;
                                    -webkit-text-size-adjust: none;
                                    text-align: center;
                                    color: #ffffff;
                                    background-color: #4b2e20;
                                    border-radius: 4px;
                                    -webkit-border-radius: 4px;
                                    -moz-border-radius: 4px;
                                    width: auto;
                                    max-width: 100%;
                                    overflow-wrap: break-word;
                                    word-break: break-word;
                                    word-wrap: break-word;
                                    mso-border-alt: none;
                                    font-size: 22px;
                                    font-weight: 700;
                                  "
                                >
                                  <span
                                    style="
                                      display: block;
                                      padding: 14px 44px 13px;
                                      line-height: 120%;
                                    "
                                    >${code}</span
                                  >
                                </a>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table
                        style="font-family: 'Cabin', sans-serif"
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        border="0"
                      >
                        <tbody>
                          <tr>
                            <td
                              style="
                                overflow-wrap: break-word;
                                word-break: break-word;
                                padding: 33px 55px 60px;
                                font-family: 'Cabin', sans-serif;
                              "
                              align="left"
                            >
                              <div
                                style="
                                  line-height: 160%;
                                  text-align: center;
                                  word-wrap: break-word;
                                "
                              >
                                <p style="line-height: 160%; font-size: 14px">
                                  <span
                                    style="font-size: 18px; line-height: 28.8px"
                                    >Regards,</span
                                  >
                                </p>
                                <p style="line-height: 160%; font-size: 14px">
                                  <span
                                    style="font-size: 18px; line-height: 28.8px; color: #f7941d;"
                                    >FastBuy
                                  </span>
                                  <span  style="font-size: 18px; line-height: 28.8px; color: #4b2e20;">Team</span>
                                </p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="u-row-container"
            style="padding: 0px; background-color: transparent"
          >
            <div
              class="u-row"
              style="
                margin: 0 auto;
                min-width: 320px;
                max-width: 600px;
                overflow-wrap: break-word;
                word-wrap: break-word;
                word-break: break-word;
                background-color: #4b2e20;
              "
            >
              <div
                style="
                  border-collapse: collapse;
                  display: table;
                  width: 100%;
                  height: 100%;
                  background-color: transparent;
                "
              >
                <div
                  class="u-col u-col-100"
                  style="
                    max-width: 320px;
                    min-width: 600px;
                    display: table-cell;
                    vertical-align: top;
                  "
                >
                  <div style="height: 100%; width: 100% !important">
                    <div
                      style="
                        box-sizing: border-box;
                        height: 100%;
                        padding: 0px;
                        border-top: 0px solid transparent;
                        border-left: 0px solid transparent;
                        border-right: 0px solid transparent;
                        border-bottom: 0px solid transparent;
                      "
                    >
                      <table
                        style="font-family: 'Cabin', sans-serif"
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        border="0"
                      >
                        <tbody>
                          <tr>
                            <td
                              style="
                                overflow-wrap: break-word;
                                word-break: break-word;
                                padding: 10px;
                                font-family: 'Cabin', sans-serif;
                              "
                              align="left"
                            >
                              <div
                                style="
                                  color: rgba(255, 235, 209, 1);
                                  line-height: 180%;
                                  text-align: center;
                                  word-wrap: break-word;
                                "
                              >
                                <p style="font-size: 14px; line-height: 180%">
                                  <span
                                    style="font-size: 16px; line-height: 28.8px"
                                    >Copyright © My FastBuy. All Rights
                                    Reserved</span
                                  >
                                </p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</body>`;
}

export function userOnboardingEmailContent(
  {
    access,
    email_address,
    password,
    role,
    phone,
    type,
    vendor,
    operator_type,
  }: OnboardingDTO,
  firstname: string,
): string {
  return `<body
  class="clean-body u_body"
  style="
    margin: 0;
    padding: 0;
    -webkit-text-size-adjust: 100%;
    background-color: rgba(255, 216, 166, 0.22);
    color: #000000;
  "
>
  <table
    id="u_body"
    style="
      border-collapse: collapse;
      table-layout: fixed;
      border-spacing: 0;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      vertical-align: top;
      min-width: 320px;
      margin: 0 auto;
      background-color: #f9f9f9;
      width: 100%;
    "
    cellpadding="0"
    cellspacing="0"
  >
    <tbody>
      <tr style="vertical-align: top">
        <td
          style="
            word-break: break-word;
            border-collapse: collapse !important;
            vertical-align: top;
          "
        >
          <div
            class="u-row-container"
            style="padding: 0px; background-color: transparent"
          >
            <div
              class="u-row"
              style="
                margin: 0 auto;
                min-width: 320px;
                max-width: 600px;
                overflow-wrap: break-word;
                word-wrap: break-word;
                word-break: break-word;
                background-color: rgba(255, 235, 209, 1);
              "
            >
              <div
                style="
                  border-collapse: collapse;
                  display: table;
                  width: 100%;
                  height: 100%;
                  background-color: transparent;
                "
              >
                <div
                  class="u-col u-col-100"
                  style="
                    max-width: 320px;
                    min-width: 600px;
                    display: table-cell;
                    vertical-align: top;
                  "
                >
                  <div style="height: 100%; width: 100% !important">
                    <div
                      style="
                        box-sizing: border-box;
                        height: 100%;
                        padding: 0px;
                        border-top: 0px solid transparent;
                        border-left: 0px solid transparent;
                        border-right: 0px solid transparent;
                        border-bottom: 0px solid transparent;
                      "
                    >
                      <table
                        style="font-family: 'Cabin', sans-serif"
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        border="0"
                      >
                        <tbody>
                          <tr>
                            <td
                              style="
                                overflow-wrap: break-word;
                                word-break: break-word;
                                padding: 20px;
                                font-family: 'Cabin', sans-serif;
                              "
                              align="left"
                            >
                              <table
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                              >
                                <tr>
                                  <td
                                    style="
                                      padding-right: 0px;
                                      padding-left: 0px;
                                    "
                                    align="center"
                                  >
                                    <div
                                      style="
                                        display: flex;
                                        flex-direction: row;
                                        justify-content: center;
                                        align-items: center;
                                      "
                                    >
                                      <img
                                        align="center"
                                        border="0"
                                        src="https://i.imgur.com/C5fgW4m.png"
                                        alt="Image"
                                        title="Image"
                                        style="
                                          outline: none;
                                          text-decoration: none;
                                          -ms-interpolation-mode: bicubic;
                                          clear: both;
                                          display: inline-block !important;
                                          border: none;
                                          height: auto;
                                          float: none;
                                          width: 30%;
                                          max-width: 140px;
                                        "
                                        width="140.0"
                                      />
                                      <h1 style="padding-left: 21px"></h1>
                                    </div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="u-row-container"
            style="padding: 0px; background-color: transparent"
          >
            <div
              class="u-row"
              style="
                margin: 0 auto;
                min-width: 320px;
                max-width: 600px;
                overflow-wrap: break-word;
                word-wrap: break-word;
                word-break: break-word;
                background-color: #f7941d;
              "
            >
              <div
                style="
                  border-collapse: collapse;
                  display: table;
                  width: 100%;
                  height: 100%;
                  background-color: transparent;
                "
              >
                <div
                  class="u-col u-col-100"
                  style="
                    max-width: 320px;
                    min-width: 600px;
                    display: table-cell;
                    vertical-align: top;
                  "
                >
                  <div style="height: 100%; width: 100% !important">
                    <div
                      style="
                        box-sizing: border-box;
                        height: 100%;
                        padding: 0px;
                        border-top: 0px solid transparent;
                        border-left: 0px solid transparent;
                        border-right: 0px solid transparent;
                        border-bottom: 0px solid transparent;
                      "
                    >
                      <table
                        style="font-family: 'Cabin', sans-serif"
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        border="0"
                      >
                        <tbody>
                          <tr>
                            <td
                              style="
                                overflow-wrap: break-word;
                                word-break: break-word;
                                padding: 10px;
                                font-family: 'Cabin', sans-serif;
                              "
                              align="left"
                            >
                              <div
                                style="
                                  color: rgba(255, 235, 209, 1);
                                  line-height: 140%;
                                  text-align: center;
                                  word-wrap: break-word;
                                "
                              >
                                <p
                                  style="
                                    font-size: 14px;
                                    line-height: 140%;
                                    padding-top: 16px;
                                  "
                                >
                                  <strong>THANKS\t FOR\t SIGNING\t UP!</strong>
                                </p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table
                        style="font-family: 'Cabin', sans-serif"
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        border="0"
                      >
                        <tbody>
                          <tr>
                            <td
                              style="
                                overflow-wrap: break-word;
                                word-break: break-word;
                                padding: 0px 10px 31px;
                                font-family: 'Cabin', sans-serif;
                              "
                              align="left"
                            >
                              <div
                                style="
                                  color: #e5eaf5;
                                  line-height: 140%;
                                  text-align: center;
                                  word-wrap: break-word;
                                "
                              >
                                <p style="font-size: 14px; line-height: 140%">
                                  <span
                                    style="font-size: 28px; line-height: 39.2px"
                                    ><strong
                                      ><span
                                        style="
                                          line-height: 39.2px;
                                          font-size: 28px;
                                        "
                                        >Proceed To Your Account</span
                                      ></strong
                                    >
                                  </span>
                                </p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="u-row-container"
            style="padding: 0px; background-color: transparent"
          >
            <div
              class="u-row"
              style="
                margin: 0 auto;
                min-width: 320px;
                max-width: 600px;
                overflow-wrap: break-word;
                word-wrap: break-word;
                word-break: break-word;
                background-color: rgba(255, 235, 209, 1);
              "
            >
              <div
                style="
                  border-collapse: collapse;
                  display: table;
                  width: 100%;
                  height: 100%;
                  background-color: transparent;
                "
              >
                <div
                  class="u-col u-col-100"
                  style="
                    max-width: 320px;
                    min-width: 600px;
                    display: table-cell;
                    vertical-align: top;
                  "
                >
                  <div style="height: 100%; width: 100% !important">
                    <div
                      style="
                        box-sizing: border-box;
                        height: 100%;
                        padding: 0px;
                        border-top: 0px solid transparent;
                        border-left: 0px solid transparent;
                        border-right: 0px solid transparent;
                        border-bottom: 0px solid transparent;
                      "
                    >
                      <table
                        style="font-family: 'Cabin', sans-serif"
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        border="0"
                      >
                        <tbody>
                          <tr>
                            <td
                              style="
                                overflow-wrap: break-word;
                                word-break: break-word;
                                padding: 33px 55px;
                                font-family: 'Cabin', sans-serif;
                              "
                              align="left"
                            >
                              <div
                                style="
                                  line-height: 160%;
                                  text-align: center;
                                  word-wrap: break-word;
                                "
                              >
                                <p style="font-size: 14px; line-height: 160%">
                                  <span
                                    style="
                                      font-size: 22px;
                                      line-height: 35.2px;
                                      color: #4b2e20;
                                    "
                                    >${'Hi ' + firstname}
                                  </span>
                                </p>
                                <p style="font-size: 14px; line-height: 160%">
                                  <span
                                    style="font-size: 18px; line-height: 28.8px"
                                    >You're almost ready to get started. Please
                                    use the credentials below to access and
                                    verify your account!
                                  </span>
                                </p>
                                <br />
                                <br />
                                <p>
                                  <strong
                                    ><span style="color: #f7941d">Email </span>
                                    <span style="color: #4b2e20"
                                      >Address:</span
                                    ></strong
                                  >
                                  ${email_address}
                                </p>
                                <p>
                                  <strong
                                    ><span style="color: #f7941d"
                                      >Account
                                    </span>
                                    <span style="color: #4b2e20"
                                      >Password:</span
                                    ></strong
                                  >
                                  ${password}
                                </p>
                                ${
                                  type === UserType.RIDER
                                    ? `
                                <p>
                                  <strong
                                    ><span style="color: #f7941d">Phone </span>
                                    <span style="color: #4b2e20"
                                      >Number:</span
                                    ></strong
                                  >
                                  ${phone}
                                </p>
                                `
                                    : type === UserType.OPERATOR
                                      ? `
                                <p>
                                  <strong
                                    ><span style="color: #f7941d"
                                      >Operator
                                    </span>
                                    <span style="color: #4b2e20">Type:</span>
                                  </strong>
                                  ${operator_type}
                                </p>
                                <p><strong>Role: </strong> ${role ?? ''}</p>
                                <p><strong>Vendor: </strong> ${vendor?.name}</p>
                                `
                                      : type === UserType.ADMIN
                                        ? `
                                <p><strong>Role: </strong> ${role}</p>
                                <p><strong>Access: </strong> ${access}</p>
                                `
                                        : `
                                <p>
                                  <strong
                                    ><span style="color: #f7941d">Email </span>
                                    <span style="color: #4b2e20">Address:</span>
                                  </strong>
                                  ${email_address}
                                </p>
                                <p>
                                  <strong
                                    ><span style="color: #f7941d"
                                      >Account
                                    </span>
                                    <span style="color: #4b2e20"
                                      >Password:</span
                                    >
                                  </strong>
                                  ${password}
                                </p>
                                `
                                }
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table
                        style="font-family: 'Cabin', sans-serif"
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        border="0"
                      ></table>

                      <table
                        style="font-family: 'Cabin', sans-serif"
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        border="0"
                      >
                        <tbody>
                          <tr>
                            <td
                              style="
                                overflow-wrap: break-word;
                                word-break: break-word;
                                padding: 33px 55px 60px;
                                font-family: 'Cabin', sans-serif;
                              "
                              align="left"
                            >
                              <div
                                style="
                                  line-height: 160%;
                                  text-align: center;
                                  word-wrap: break-word;
                                "
                              >
                                <p style="line-height: 160%; font-size: 14px">
                                  <span
                                    style="font-size: 18px; line-height: 28.8px"
                                    >Regards,</span
                                  >
                                </p>
                                <p style="line-height: 160%; font-size: 14px">
                                  <span
                                    style="
                                      font-size: 18px;
                                      line-height: 28.8px;
                                      color: #f7941d;
                                    "
                                    >FastBuy
                                  </span>
                                  <span
                                    style="
                                      font-size: 18px;
                                      line-height: 28.8px;
                                      color: #4b2e20;
                                    "
                                    >Team</span
                                  >
                                </p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="u-row-container"
            style="padding: 0px; background-color: transparent"
          >
            <div
              class="u-row"
              style="
                margin: 0 auto;
                min-width: 320px;
                max-width: 600px;
                overflow-wrap: break-word;
                word-wrap: break-word;
                word-break: break-word;
                background-color: #4b2e20;
              "
            >
              <div
                style="
                  border-collapse: collapse;
                  display: table;
                  width: 100%;
                  height: 100%;
                  background-color: transparent;
                "
              >
                <div
                  class="u-col u-col-100"
                  style="
                    max-width: 320px;
                    min-width: 600px;
                    display: table-cell;
                    vertical-align: top;
                  "
                >
                  <div style="height: 100%; width: 100% !important">
                    <div
                      style="
                        box-sizing: border-box;
                        height: 100%;
                        padding: 0px;
                        border-top: 0px solid transparent;
                        border-left: 0px solid transparent;
                        border-right: 0px solid transparent;
                        border-bottom: 0px solid transparent;
                      "
                    >
                      <table
                        style="font-family: 'Cabin', sans-serif"
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        border="0"
                      >
                        <tbody>
                          <tr>
                            <td
                              style="
                                overflow-wrap: break-word;
                                word-break: break-word;
                                padding: 10px;
                                font-family: 'Cabin', sans-serif;
                              "
                              align="left"
                            >
                              <div
                                style="
                                  color: rgba(255, 235, 209, 1);
                                  line-height: 180%;
                                  text-align: center;
                                  word-wrap: break-word;
                                "
                              >
                                <p style="font-size: 14px; line-height: 180%">
                                  <span
                                    style="font-size: 16px; line-height: 28.8px"
                                    >Copyright © My FastBuy. All Rights
                                    Reserved</span
                                  >
                                </p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</body>
`;
}

export function passwordEmailContent(code: any, firstname: string): string {
  return `<body
  class="clean-body u_body"
  style="
    margin: 0;
    padding: 0;
    -webkit-text-size-adjust: 100%;
    background-color: rgba(255, 216, 166, 0.22);
    color: #000000;
  "
>
  <table
    id="u_body"
    style="
      border-collapse: collapse;
      table-layout: fixed;
      border-spacing: 0;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      vertical-align: top;
      min-width: 320px;
      margin: 0 auto;
      background-color: #f9f9f9;
      width: 100%;
    "
    cellpadding="0"
    cellspacing="0"
  >
    <tbody>
      <tr style="vertical-align: top">
        <td
          style="
            word-break: break-word;
            border-collapse: collapse !important;
            vertical-align: top;
          "
        >
          <div
            class="u-row-container"
            style="padding: 0px; background-color: transparent"
          >
            <div
              class="u-row"
              style="
                margin: 0 auto;
                min-width: 320px;
                max-width: 600px;
                overflow-wrap: break-word;
                word-wrap: break-word;
                word-break: break-word;
                background-color: rgba(255, 235, 209, 1);
              "
            >
              <div
                style="
                  border-collapse: collapse;
                  display: table;
                  width: 100%;
                  height: 100%;
                  background-color: transparent;
                "
              >
                <div
                  class="u-col u-col-100"
                  style="
                    max-width: 320px;
                    min-width: 600px;
                    display: table-cell;
                    vertical-align: top;
                  "
                >
                  <div style="height: 100%; width: 100% !important">
                    <div
                      style="
                        box-sizing: border-box;
                        height: 100%;
                        padding: 0px;
                        border-top: 0px solid transparent;
                        border-left: 0px solid transparent;
                        border-right: 0px solid transparent;
                        border-bottom: 0px solid transparent;
                      "
                    >
                      <table
                        style="font-family: 'Cabin', sans-serif"
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        border="0"
                      >
                        <tbody>
                          <tr>
                            <td
                              style="
                                overflow-wrap: break-word;
                                word-break: break-word;
                                padding: 20px;
                                font-family: 'Cabin', sans-serif;
                              "
                              align="left"
                            >
                              <table
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                              >
                                <tr>
                                  <td
                                    style="
                                      padding-right: 0px;
                                      padding-left: 0px;
                                    "
                                    align="center"
                                  >
                                    <div
                                      style="
                                        display: flex;
                                        flex-direction: row;
                                        justify-content: center;
                                        align-items: center;
                                      "
                                    >
                                      <img
                                        align="center"
                                        border="0"
                                        src="https://i.imgur.com/C5fgW4m.png"
                                        alt="Image"
                                        title="Image"
                                        style="
                                          outline: none;
                                          text-decoration: none;
                                          -ms-interpolation-mode: bicubic;
                                          clear: both;
                                          display: inline-block !important;
                                          border: none;
                                          height: auto;
                                          float: none;
                                          width: 30%;
                                          max-width: 140px;
                                        "
                                        width="140.0"
                                      />
                                    </div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="u-row-container"
            style="padding: 0px; background-color: transparent"
          >
            <div
              class="u-row"
              style="
                margin: 0 auto;
                min-width: 320px;
                max-width: 600px;
                overflow-wrap: break-word;
                word-wrap: break-word;
                word-break: break-word;
                background-color: #f7941d;
              "
            >
              <div
                style="
                  border-collapse: collapse;
                  display: table;
                  width: 100%;
                  height: 100%;
                  background-color: transparent;
                "
              >
                <div
                  class="u-col u-col-100"
                  style="
                    max-width: 320px;
                    min-width: 600px;
                    display: table-cell;
                    vertical-align: top;
                  "
                >
                  <div style="height: 100%; width: 100% !important">
                    <div
                      style="
                        box-sizing: border-box;
                        height: 100%;
                        padding: 0px;
                        border-top: 0px solid transparent;
                        border-left: 0px solid transparent;
                        border-right: 0px solid transparent;
                        border-bottom: 0px solid transparent;
                      "
                    >
                      <table
                        style="font-family: 'Cabin', sans-serif"
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        border="0"
                      >
                        <tbody>
                          <tr>
                            <td
                              style="
                                overflow-wrap: break-word;
                                word-break: break-word;
                                padding: 0px 10px 31px;
                                font-family: 'Cabin', sans-serif;
                              "
                              align="left"
                            >
                              <div
                                style="
                                  color: #e5eaf5;
                                  line-height: 140%;
                                  text-align: center;
                                  word-wrap: break-word;
                                "
                              >
                                <br />
                                <p style="font-size: 14px; line-height: 140%">
                                  <span
                                    style="font-size: 28px; line-height: 39.2px"
                                    ><strong
                                      ><span
                                        style="
                                          line-height: 39.2px;
                                          font-size: 28px;
                                        "
                                        >Reset Your Account Password</span
                                      ></strong
                                    >
                                  </span>
                                </p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="u-row-container"
            style="padding: 0px; background-color: transparent"
          >
            <div
              class="u-row"
              style="
                margin: 0 auto;
                min-width: 320px;
                max-width: 600px;
                overflow-wrap: break-word;
                word-wrap: break-word;
                word-break: break-word;
                background-color: rgba(255, 235, 209, 1);
              "
            >
              <div
                style="
                  border-collapse: collapse;
                  display: table;
                  width: 100%;
                  height: 100%;
                  background-color: transparent;
                "
              >
                <div
                  class="u-col u-col-100"
                  style="
                    max-width: 320px;
                    min-width: 600px;
                    display: table-cell;
                    vertical-align: top;
                  "
                >
                  <div style="height: 100%; width: 100% !important">
                    <div
                      style="
                        box-sizing: border-box;
                        height: 100%;
                        padding: 0px;
                        border-top: 0px solid transparent;
                        border-left: 0px solid transparent;
                        border-right: 0px solid transparent;
                        border-bottom: 0px solid transparent;
                      "
                    >
                      <table
                        style="font-family: 'Cabin', sans-serif"
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        border="0"
                      >
                        <tbody>
                          <tr>
                            <td
                              style="
                                overflow-wrap: break-word;
                                word-break: break-word;
                                padding: 33px 55px;
                                font-family: 'Cabin', sans-serif;
                              "
                              align="left"
                            >
                              <div
                                style="
                                  line-height: 160%;
                                  text-align: center;
                                  word-wrap: break-word;
                                "
                              >
                                <p style="font-size: 14px; line-height: 160%">
                                  <span
                                    style="
                                      font-size: 22px;
                                      line-height: 35.2px;
                                      color: #4b2e20;
                                    "
                                    >${'Hi ' + firstname}
                                  </span>
                                </p>
                                <p style="font-size: 14px; line-height: 160%">
                                  <span
                                    style="font-size: 18px; line-height: 28.8px"
                                    >You're about to recover your account.
                                    Please use the code below to complete your
                                    password reset process and enjoy our
                                    platform!
                                  </span>
                                </p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table
                        style="font-family: 'Cabin', sans-serif"
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        border="0"
                      >
                        <tbody>
                          <tr>
                            <td
                              style="
                                overflow-wrap: break-word;
                                word-break: break-word;
                                padding: 10px;
                                font-family: 'Cabin', sans-serif;
                              "
                              align="left"
                            >
                              <div align="center">
                                <a
                                  href=""
                                  target="_self"
                                  class="v-button"
                                  style="
                                    box-sizing: border-box;
                                    display: inline-block;
                                    font-family: 'Cabin', sans-serif;
                                    text-decoration: none;
                                    -webkit-text-size-adjust: none;
                                    text-align: center;
                                    color: #ffffff;
                                    background-color: #4b2e20;
                                    border-radius: 4px;
                                    -webkit-border-radius: 4px;
                                    -moz-border-radius: 4px;
                                    width: auto;
                                    max-width: 100%;
                                    overflow-wrap: break-word;
                                    word-break: break-word;
                                    word-wrap: break-word;
                                    mso-border-alt: none;
                                    font-size: 22px;
                                    font-weight: 700;
                                  "
                                >
                                  <span
                                    style="
                                      display: block;
                                      padding: 14px 44px 13px;
                                      line-height: 120%;
                                    "
                                    >${code}</span
                                  >
                                </a>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table
                        style="font-family: 'Cabin', sans-serif"
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        border="0"
                      >
                        <tbody>
                          <tr>
                            <td
                              style="
                                overflow-wrap: break-word;
                                word-break: break-word;
                                padding: 33px 55px 60px;
                                font-family: 'Cabin', sans-serif;
                              "
                              align="left"
                            >
                              <div
                                style="
                                  line-height: 160%;
                                  text-align: center;
                                  word-wrap: break-word;
                                "
                              >
                                <p style="line-height: 160%; font-size: 14px">
                                  <span
                                    style="font-size: 18px; line-height: 28.8px"
                                    >Regards,</span
                                  >
                                </p>
                                <p style="line-height: 160%; font-size: 14px">
                                    <span
                                      style="font-size: 18px; line-height: 28.8px; color: #f7941d;"
                                      >FastBuy
                                    </span>
                                    <span  style="font-size: 18px; line-height: 28.8px; color: #4b2e20;">Team</span>
                                  </p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="u-row-container"
            style="padding: 0px; background-color: transparent"
          >
            <div
              class="u-row"
              style="
                margin: 0 auto;
                min-width: 320px;
                max-width: 600px;
                overflow-wrap: break-word;
                word-wrap: break-word;
                word-break: break-word;
                background-color: rgba(255, 216, 166, 0.22);
              "
            >
              <div
                style="
                  border-collapse: collapse;
                  display: table;
                  width: 100%;
                  height: 100%;
                  background-color: transparent;
                "
              >
                <div
                  class="u-col u-col-100"
                  style="
                    max-width: 320px;
                    min-width: 600px;
                    display: table-cell;
                    vertical-align: top;
                  "
                >
                  <div style="height: 100%; width: 100% !important">
                    <div
                      style="
                        box-sizing: border-box;
                        height: 100%;
                        padding: 0px;
                        border-top: 0px solid transparent;
                        border-left: 0px solid transparent;
                        border-right: 0px solid transparent;
                        border-bottom: 0px solid transparent;
                      "
                    >
                      <table
                        style="font-family: 'Cabin', sans-serif"
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        border="0"
                      >
                        <tbody>
                          <tr>
                            <td
                              style="
                                overflow-wrap: break-word;
                                word-break: break-word;
                                padding: 41px 55px 18px;
                                font-family: 'Cabin', sans-serif;
                              "
                              align="left"
                            >
                              <div
                                style="
                                  color: #4b2e20;
                                  line-height: 160%;
                                  text-align: center;
                                  word-wrap: break-word;
                                "
                              >
                                <p style="font-size: 14px; line-height: 160%">
                                  <span
                                    style="font-size: 20px; line-height: 32px"
                                    ><strong>Get in touch</strong></span
                                  >
                                </p>

                                <p style="font-size: 14px; line-height: 160%">
                                  <span
                                    style="
                                      font-size: 16px;
                                      line-height: 25.6px;
                                      color: #f7941d;
                                    "
                                    >hello@myfastbuy.com</span
                                  >
                                </p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="u-row-container"
            style="padding: 0px; background-color: transparent"
          >
            <div
              class="u-row"
              style="
                margin: 0 auto;
                min-width: 320px;
                max-width: 600px;
                overflow-wrap: break-word;
                word-wrap: break-word;
                word-break: break-word;
                background-color: #4b2e20;
              "
            >
              <div
                style="
                  border-collapse: collapse;
                  display: table;
                  width: 100%;
                  height: 100%;
                  background-color: transparent;
                "
              >
                <div
                  class="u-col u-col-100"
                  style="
                    max-width: 320px;
                    min-width: 600px;
                    display: table-cell;
                    vertical-align: top;
                  "
                >
                  <div style="height: 100%; width: 100% !important">
                    <div
                      style="
                        box-sizing: border-box;
                        height: 100%;
                        padding: 0px;
                        border-top: 0px solid transparent;
                        border-left: 0px solid transparent;
                        border-right: 0px solid transparent;
                        border-bottom: 0px solid transparent;
                      "
                    >
                      <table
                        style="font-family: 'Cabin', sans-serif"
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        border="0"
                      >
                        <tbody>
                          <tr>
                            <td
                              style="
                                overflow-wrap: break-word;
                                word-break: break-word;
                                padding: 10px;
                                font-family: 'Cabin', sans-serif;
                              "
                              align="left"
                            >
                            <div
                            style="
                              color: rgba(255, 235, 209, 1);
                              line-height: 180%;
                              text-align: center;
                              word-wrap: break-word;
                            "
                          >
                            <p style="font-size: 14px; line-height: 180%">
                              <span
                                style="font-size: 16px; line-height: 28.8px"
                                >Copyright © My FastBuy. All Rights
                                Reserved</span
                              >
                            </p>
                          </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</body>
`;
}
