# Working Project
### Feat
1. API Keys
- Các API Key được định nghĩa ở `backendjs\.env`
- Key `API_KEY_REGISTER` dùng cho xác thực khi đăng ký ở header `X-Api-Key`.
- Key `API_KEY_MANAGE` có quyền:
    + Gửi request PUT để update users
    + Gửi request để DEPOSIT và WITHDRAW credtis cho user.

2. Auth
- Thêm một `X-Api-Key` vào header để xác thực `/api/auth/register` bắt buộc khi đăng ký. Giá trị của api key này lấy ở `API_KEY_REGISTER` của `.env`
- Thêm:
    + Field `Invite Code` vào Frontend register form để chấp nhận như `X-Api-Key`
    + Field `username`
- Tạo api key cho từng user khi đăng ký thành công, key này trả về body.
- API Key của mỗi user được dùng để `auth` và thực hiện Request mà không cần đăng nhập bằng basic auth.
- Thêm field `username` vào bảng users dạng varchar/text, và unique. Chấp nhận 0-9, a-z as A-Z. Field này là `required` khi tạo users.
- Endpoint đăng ký sẽ có dạng `/api/auth/register` với body gồm: `email, password, name, username`. Status hoặc định là `active`
- Dùng `crypto.randomBytes(32)` tạo api key cho mỗi user, với format là: `username_<crypto.randomBytes(32)>`.
- Thêm enum field `status` với value là `active` và `inactive` để chỉnh định khả năng của users:
    + Active: User hoạt động bình thường
    + Inactive: User bị khóa, không thể đăng nhập hoặc thực hiện request.
- Thêm các endpoint 
    + Cho phép PUT đến `users` theo kiểu: `api/users/:id` với mục đích để cập nhật `status` hoặc chỉnh sửa thông tin user.
    + Cho phép check current user theo kiểu: `api/users/me` với mục đích kiểm tra thông tin hiện tại, kiểm tra balance của `credits`

3. Credits
- Thêm endpoint DEPOSIT và WITHDRAW hoặc gì đó để biểu thị lệnh cộng vào và trừ đi vào số lượng `credits` của một users nào đó, có lưu lại lịch sử. 
- Ví dụ lệnh nạp thêm credits hoặc trừ số credits đã nạp trước đó khi hủy lệnh/hủy đơn hàng.

4. Permission
- Tạo `backendjs/route-permissions.json`
    + Liệt kê toàn bộ endpoint
    + Thêm các quy ước quyền: public, auth, admin, disabled
        + `public` : Guest / tự do
        + `auth` : Cần đăng nhập
        + `admin` : Chỉ admin
        + `disabled` : Tắt / chặn request
    - Thêm policy file vào `backendjs/.env`
    - Chỉnh sửa code để xử lý quyền theo `route-permissions.json`

5. Frontend
- Xóa các block ở Homepage: `KIẾN THỨC BÁT TỰ`, `KHÁCH HÀNG GẦN ĐÂY` và `Viet Lac So - luận giải mọi thứ cuộc đời`, `Dựa trên lá số và các cuộc tư vấn trước đây của bạn`
- Đổi font stack sang:
```
font-family: 
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  Roboto,
  "Helvetica Neue",
  Arial,
  "Noto Sans SC",
  "Noto Sans TC",
  "Noto Sans JP",
  "Noto Sans KR",
  "Microsoft YaHei",
  "Hiragino Sans GB",
  "PingFang SC",
  "Meiryo UI",
  "Malgun Gothic",
  "Apple SD Gothic Neo",
  sans-serif;
```
- Xóa `background-image` ở `body::before`
- Thêm `background-color` với giá trị `#0f0f0f`

### Issues
1. Quyền hạn
- Hiện tại Guest đang có quyền gửi request. Hãy kiểm tra và lên checklist yêu cầu đăng nhập để thực hiện các request

2. Khác
- Tăt / xóa các thông tin về 