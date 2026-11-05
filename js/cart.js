// ===================== CÂU 6: QUẢN LÝ STATE GIỎ HÀNG BẰNG ĐỐI TƯỢNG JS =====================
// Giỏ hàng là 1 object có thuộc tính (items) và các phương thức (them, xoa, tinhTong, render...)
// Khóa của mỗi dòng = id + "|" + variant  → cùng sản phẩm + cùng màu/size thì tăng số lượng.

var cart = {
  items: docLocal("gioHang", {}),   // { "1|Đen/M": { id, title, price, variant, soLuong } }

  them: function (sanPham, variant) {
    var khoa = sanPham.id + "|" + variant;
    if (this.items[khoa]) {
      this.items[khoa].soLuong = this.items[khoa].soLuong + 1;     // đã có → tăng SL
    } else {
      this.items[khoa] = {                                          // chưa có → thêm mới
        id: sanPham.id,
        title: sanPham.title,
        price: sanPham.price,
        variant: variant,
        soLuong: 1
      };
    }
    this.capNhat();
  },

  doiSoLuong: function (khoa, soLuong) {
    soLuong = parseInt(soLuong);
    if (isNaN(soLuong) || soLuong <= 0) {
      delete this.items[khoa];
    } else {
      this.items[khoa].soLuong = soLuong;
    }
    this.capNhat();
  },

  xoa: function (khoa) {
    delete this.items[khoa];
    this.capNhat();
  },

  xoaHet: function () {
    this.items = {};
    this.capNhat();
  },

  // Tự động tính lại tổng tiền
  tinhTong: function () {
    var tong = 0;
    for (var khoa in this.items) {
      tong = tong + this.items[khoa].price * this.items[khoa].soLuong;
    }
    return tong;
  },

  tongSoLuong: function () {
    var dem = 0;
    for (var khoa in this.items) dem = dem + this.items[khoa].soLuong;
    return dem;
  },

  // Lưu + vẽ lại bảng mini-cart
  capNhat: function () {
    luuLocal("gioHang", this.items);
    this.render();
  },

  render: function () {
    var html = "";
    for (var khoa in this.items) {
      var dong = this.items[khoa];
      html += "<tr>" +
        "<td>" + dong.title.substring(0, 30) + "</td>" +
        "<td>" + dong.variant + "</td>" +
        "<td><input type='number' min='0' value='" + dong.soLuong + "' " +
        "onchange=\"cart.doiSoLuong('" + khoa + "', this.value)\"></td>" +
        "<td>" + dinhDangTien(dong.price * dong.soLuong) + "</td>" +
        "<td><button type='button' onclick=\"cart.xoa('" + khoa + "')\">x</button></td>" +
        "</tr>";
    }
    if (html == "") html = "<tr><td colspan='5'>Giỏ hàng trống</td></tr>";
    document.getElementById("bangGio").innerHTML = html;
    document.getElementById("tongTien").innerHTML = dinhDangTien(this.tinhTong());
    document.getElementById("soLuongGio").innerHTML = this.tongSoLuong();
  },

  batTat: function () {
    document.getElementById("miniCart").classList.toggle("an");
  }
};
