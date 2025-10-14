# Hướng dẫn sử dụng Multiple Boards

## Tổng quan
Ứng dụng đã được cập nhật để hỗ trợ nhiều boards khác nhau, mỗi board có thể có nhiều lists và cards riêng biệt.

## Tính năng mới

### 1. Trang chủ - Danh sách Boards
- **URL**: `/`
- **Mô tả**: Hiển thị tất cả boards của user
- **Tính năng**:
  - Xem danh sách tất cả boards
  - Tạo board mới
  - Chỉnh sửa tên board
  - Xóa board
  - Click vào board để vào chi tiết

### 2. Trang chi tiết Board
- **URL**: `/board/:boardId`
- **Mô tả**: Hiển thị chi tiết của một board cụ thể
- **Tính năng**:
  - Xem tất cả lists trong board
  - Tạo list mới
  - Chỉnh sửa/xóa list
  - Tạo/chỉnh sửa/xóa cards
  - Drag & drop cards giữa các lists
  - Đánh dấu hoàn thành tasks
  - Thêm ngày hết hạn
  - Quay lại trang chủ

## Cấu trúc Routing

```
/ (trang chủ)
├── Hiển thị danh sách boards
├── Tạo board mới
└── Click board → /board/:boardId

/board/:boardId (chi tiết board)
├── Hiển thị lists và cards
├── Quản lý lists
├── Quản lý cards
└── Nút "Quay lại" → /
```

## Các component mới

### BoardList.tsx
- Hiển thị danh sách boards dạng grid
- Tạo board mới
- Chỉnh sửa/xóa board
- Navigation đến board detail

### BoardDetail.tsx
- Hiển thị chi tiết một board
- Quản lý lists và cards
- Drag & drop functionality
- Navigation về trang chủ

## CSS và Styling

### Cải thiện CSS
- Đã sửa lỗi hiển thị trắng khi thêm trang/list
- Cải thiện responsive design
- Đảm bảo backdrop-blur hoạt động đúng
- Smooth transitions

### Classes quan trọng
- `.min-h-screen`: Đảm bảo full height
- `.backdrop-blur-sm`: Hiệu ứng blur
- `.transition-all`: Smooth transitions
- `.overflow-x-auto`: Horizontal scroll cho lists

## API Updates

### Boards API
- `getMyBoards()`: Lấy danh sách boards
- `createBoard()`: Tạo board mới
- `getBoard(id)`: Lấy chi tiết board
- `updateBoard(id, data)`: Cập nhật board
- `deleteBoard(id)`: Xóa board

## Cách sử dụng

1. **Truy cập trang chủ** (`/`):
   - Xem tất cả boards
   - Click "Tạo bảng mới" để tạo board

2. **Vào board cụ thể** (`/board/:boardId`):
   - Click vào board từ trang chủ
   - Quản lý lists và cards
   - Sử dụng nút "Quay lại" để về trang chủ

3. **Navigation**:
   - Header có link "Trang chủ"
   - Logo cũng link về trang chủ
   - Nút "Quay lại" trong board detail

## Lưu ý kỹ thuật

- Sử dụng `react-router` (không phải `react-router-dom`)
- Routing được cấu hình trong `App.tsx`
- Mỗi board có URL riêng biệt
- State được quản lý riêng cho từng component
- CSS được tối ưu để tránh lỗi hiển thị trắng



