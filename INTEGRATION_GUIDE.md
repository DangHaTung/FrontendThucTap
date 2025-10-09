# Hướng dẫn tích hợp Backend vào TrelloClone

## Tổng quan
Component TrelloClone đã được tích hợp hoàn toàn với backend API để thực hiện các chức năng CRUD cho boards, lists và cards.

## Các thay đổi chính

### 1. API Service Files
- **`/src/api/boards.ts`**: API functions cho boards
- **`/src/api/lists.ts`**: API functions cho lists  
- **`/src/api/cards.ts`**: API functions cho cards
- **`/src/api/index.ts`**: Axios configuration với authentication interceptors

### 2. Component Updates
- **State Management**: Chuyển từ local state sang API-based state
- **CRUD Operations**: Tất cả operations đều gọi API backend
- **Error Handling**: Thêm error states và loading states
- **Type Safety**: Sử dụng TypeScript interfaces cho tất cả data types

## Cấu trúc Data

### Board
```typescript
interface Board {
  _id: string;
  title: string;
  owner: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
}
```

### List
```typescript
interface List {
  _id: string;
  title: string;
  boardId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}
```

### Card
```typescript
interface Card {
  _id: string;
  title: string;
  description: string;
  listId: string;
  position: number;
  createdBy: string;
  assignees: string[];
  labels: string[];
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}
```

## Các tính năng đã tích hợp

### ✅ Boards Management
- Load danh sách boards của user
- Tạo board mới
- Cập nhật tên board
- Xóa board

### ✅ Lists Management  
- Load danh sách lists của board
- Tạo list mới
- Cập nhật tên list
- Xóa list

### ✅ Cards Management
- Load cards của list
- Tạo card mới
- Cập nhật tiêu đề card
- Cập nhật due date
- Xóa card
- Drag & drop cards giữa các lists

### ✅ Authentication
- Tự động thêm Bearer token vào requests
- Redirect về login khi token hết hạn
- Error handling cho authentication

### ✅ UI/UX
- Loading states khi fetch data
- Error states với retry button
- Optimistic updates cho better UX
- TypeScript type safety

## Cách sử dụng

### 1. Cấu hình Environment
Tạo file `.env` trong thư mục Frontend với nội dung:
```
VITE_PUBLIC_URL=http://localhost:3000/api
```

Hoặc component sẽ tự động sử dụng fallback URL `http://localhost:3000/api` nếu không có env variable.

### 2. Authentication
Component sẽ tự động sử dụng token từ localStorage. Đảm bảo user đã login và có valid token.

### 3. Debug API Connection
Component có built-in debug utilities để kiểm tra kết nối API:
- Mở Developer Console để xem debug logs
- Component sẽ test authentication trước khi load data
- Error messages sẽ hiển thị chi tiết về vấn đề kết nối

### 4. Error Handling
- Nếu có lỗi network, component sẽ hiển thị error message với retry button
- Nếu token hết hạn, user sẽ được redirect về login page
- Component sẽ tự động tạo board mặc định nếu user chưa có board nào

## Lưu ý

### Completed Status
Backend hiện tại không có field `completed` trong Card model. Component sử dụng label `"completed"` để track trạng thái hoàn thành.

### Date Format
- Backend sử dụng ISO date strings
- Frontend tự động convert giữa display format (DD/MM/YYYY) và input format (YYYY-MM-DD)

### Drag & Drop
Drag & drop được implement với API calls để update position của cards trong database.

## API Endpoints được sử dụng

### Boards
- `GET /api/boards` - Lấy danh sách boards
- `POST /api/boards` - Tạo board mới
- `PUT /api/boards/:id` - Cập nhật board
- `DELETE /api/boards/:id` - Xóa board

### Lists
- `GET /api/boards/:boardId/lists` - Lấy danh sách lists
- `POST /api/boards/:boardId/lists` - Tạo list mới
- `PUT /api/boards/:boardId/lists/:listId` - Cập nhật list
- `DELETE /api/boards/:boardId/lists/:listId` - Xóa list

### Cards
- `GET /api/lists/:listId/cards` - Lấy danh sách cards
- `POST /api/boards/:boardId/lists/:listId/cards` - Tạo card mới
- `PUT /api/cards/:cardId` - Cập nhật card
- `DELETE /api/cards/:cardId` - Xóa card
- `POST /api/cards/:cardId/move` - Di chuyển card

## Troubleshooting

### Common Issues
1. **"Cannot GET" Error**: 
   - Kiểm tra backend server có đang chạy trên port 3000 không
   - Verify API base URL trong browser network tab
   - Đảm bảo backend routes được mount đúng trong index.js

2. **Authentication Error**: 
   - Kiểm tra token trong localStorage
   - Verify token format (Bearer token)
   - Check backend auth middleware có hoạt động đúng không

3. **CORS Error**: 
   - Đảm bảo backend đã cấu hình CORS cho frontend domain
   - Check backend index.js có sử dụng cors middleware

4. **Empty Data**: 
   - Component sẽ tự động tạo board mặc định nếu không có data
   - Kiểm tra database connection trong backend
   - Verify user có quyền truy cập boards

### Debug Steps
1. **Mở Developer Console** để xem debug logs
2. **Check Network Tab** để xem API requests và responses
3. **Verify Token** trong Application > Local Storage
4. **Test API endpoints** trực tiếp với Postman hoặc curl
5. **Check Backend Logs** để xem server-side errors

### Debug Commands
```javascript
// Trong browser console
localStorage.getItem('token') // Kiểm tra token
debugApi.testAuth() // Test authentication
debugApi.testAllEndpoints() // Test tất cả endpoints
```
