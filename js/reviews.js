// ===================== CÂU 5: XỬ LÝ VÀ PHÂN TÍCH DỮ LIỆU XML (reviews.xml) =====================
var thongKeDanhGia = {};   // { product_id: { tong, dem, ds: [ {customer_id, rating, comment, date} ] } }
var dsKhachHang = [];      // đọc từ customers.json để đổi mã KH → tên

// Đọc reviews.xml dưới dạng CHUỖI rồi dùng DOMParser (đúng yêu cầu đề)
function docDanhGia(callback) {
  taiFile("data/reviews.xml", function (xhr) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");

    var dsReview = xmlDoc.getElementsByTagName("review");
    thongKeDanhGia = {};
    for (var i = 0; i < dsReview.length; i++) {
      var r = dsReview[i];
      var pid = layText(r, "product_id");
      var diem = parseFloat(layText(r, "rating"));
      if (!thongKeDanhGia[pid]) {
        thongKeDanhGia[pid] = { tong: 0, dem: 0, ds: [] };
      }
      thongKeDanhGia[pid].tong = thongKeDanhGia[pid].tong + diem;
      thongKeDanhGia[pid].dem = thongKeDanhGia[pid].dem + 1;
      thongKeDanhGia[pid].ds.push({
        customer_id: layText(r, "customer_id"),
        rating: diem,
        comment: layText(r, "comment"),
        date: layText(r, "date")
      });
    }
    if (callback) callback();
  });
}

function diemTrungBinh(pid) {
  var tk = thongKeDanhGia[pid];
  if (!tk || tk.dem == 0) return 0;
  return tk.tong / tk.dem;
}

// Tạo mới thẻ <span> chứa số sao trung bình, chèn lên ảnh của từng sản phẩm trên DOM
function hienSaoTrungBinh() {
  var dsThe = document.getElementsByClassName("the-sp");
  for (var i = 0; i < dsThe.length; i++) {
    var the = dsThe[i];
    var pid = the.getAttribute("data-id");
    var khungAnh = the.getElementsByClassName("khung-anh")[0];

    var cu = khungAnh.getElementsByClassName("sao-tb");   // tránh chèn trùng khi render lại
    if (cu.length > 0) khungAnh.removeChild(cu[0]);

    var tk = thongKeDanhGia[pid];
    var span = document.createElement("span");
    span.className = "sao-tb";
    if (tk) {
      span.innerHTML = "★ " + diemTrungBinh(pid).toFixed(1) + " (" + tk.dem + ")";
    } else {
      span.innerHTML = "Chưa có đánh giá";
    }
    khungAnh.appendChild(span);
  }
}

function timTenKhach(maKH) {
  for (var i = 0; i < dsKhachHang.length; i++) {
    if (dsKhachHang[i].id == maKH) return dsKhachHang[i].hoTen;
  }
  return maKH;
}

// Bấm "Rating detail" → danh sách khách hàng đã đánh giá sản phẩm
function hienChiTietDanhGia(sanPham) {
  var tk = thongKeDanhGia[sanPham.id];
  var html = "<h3>Đánh giá: " + sanPham.title + "</h3>";
  if (!tk) {
    html += "<p>Sản phẩm chưa có đánh giá.</p>";
  } else {
    html += "<p>Điểm trung bình: <b>" + diemTrungBinh(sanPham.id).toFixed(1) + "/5</b> từ " + tk.dem + " lượt</p>";
    html += "<table class='bang'><tr><th>Khách hàng</th><th>Số sao</th><th>Nhận xét</th><th>Ngày</th></tr>";
    for (var i = 0; i < tk.ds.length; i++) {
      var r = tk.ds[i];
      html += "<tr><td>" + timTenKhach(r.customer_id) + " (" + r.customer_id + ")</td>" +
        "<td>" + "★".repeat(r.rating) + "</td>" +
        "<td>" + r.comment + "</td><td>" + r.date + "</td></tr>";
    }
    html += "</table>";
  }
  moModal(html);
}
