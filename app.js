const app = document.getElementById("productos");
const items = document.getElementById("items");
const footer = document.getElementById("footer");
const send = document.getElementById("send");
const editar = document.getElementById("editar");

const fragment = document.createDocumentFragment();
const templateProductos = document.getElementById("template-productos").content;
const templateItems = document.getElementById("template-items").content;
const templateFooter = document.getElementById("template-footer").content;

const carrito = {};
let arrayTemp = [];
let idEditar = null;

items.addEventListener("click", (e) => {
  btnActions(e);
});

document.addEventListener("DOMContentLoaded", (e) => {
  fetchData();
  document.getElementById("editar").hidden = true;
  document.getElementById("idproducto").hidden = true;
  document.getElementById("labelid").hidden = true;
});

app.addEventListener("click", (e) => {
  agregarCarrito(e);
  eliminarProducto(e);
  ProductoAactualizar(e);
});

send.addEventListener("click", (e) => {
  crearNewProducto();
});

editar.addEventListener("click", (e) => {
  actualizarProducto();
});

const fetchData = async () => {
  const res = await fetch(
    "https://api.escuelajs.co/api/v1/products?offset=0&limit=10"
  );

  const data = await res.json();
  formatterData(data.results);
};

const formatterData = async (data) => {
  for (const iterator of data) {
    const formatter = {
      id: iterator.id,
      name: iterator.original_title,
      precio: getRandomInt(1000, 10000),
      image: `https://image.tmdb.org/t/p/w1280${iterator.poster_path}`,
    };

    arrayTemp.push(formatter);
  }

  pintarCard(arrayTemp);
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

const pintarCard = (data) => {
  data.forEach((element) => {
    templateProductos.querySelector("h5").textContent = element.name;
    templateProductos.querySelector("p").textContent = element.precio;
    templateProductos.querySelector("img").setAttribute("src", element.image);
    templateProductos.querySelector("button").dataset.id = element.id;
    templateProductos.querySelector(".btn-danger").dataset.id = element.id;
    templateProductos.querySelector(".btn-info").dataset.id = element.id;
    const clone = templateProductos.cloneNode(true);
    fragment.appendChild(clone);
  });
  app.appendChild(fragment);
};

const agregarCarrito = (e) => {
  if (e.target.classList.contains("btn-dark")) {
    setCarriro(e.target.parentElement);
  }
};

const setCarriro = (data) => {
  llenarCarrito(data);
};

const llenarCarrito = (data) => {
  const producto = {
    id: data.querySelector("button").dataset.id,
    name: data.querySelector("h5").textContent,
    precio: data.querySelector("p").textContent,
    cantidad: 1,
  };

  if (carrito.hasOwnProperty(producto.id)) {
    producto.cantidad = carrito[producto.id].cantidad + 1;
  }

  carrito[producto.id] = { ...producto };
  pintarCarro();
};

const pintarCarro = () => {
  items.innerHTML = "";
  Object.values(carrito).forEach((data) => {
    templateItems.querySelector("th").textContent = data.id;
    templateItems.querySelectorAll("td")[0].textContent = data.name;
    templateItems.querySelectorAll("td")[1].textContent = data.cantidad;
    templateItems.querySelector("span").textContent =
      data.precio * data.cantidad;

    templateItems.querySelector(".btn-info").dataset.id = data.id;
    templateItems.querySelector(".btn-danger").dataset.id = data.id;
    const clone = templateItems.cloneNode(true);
    fragment.appendChild(clone);
  });

  items.appendChild(fragment);
  pintarFooter();
};

const pintarFooter = () => {
  footer.innerHTML = "";

  const cantidad_productos = Object.values(carrito).reduce(
    (acc, { cantidad }) => acc + cantidad,
    0
  );

  const valor_total = Object.values(carrito).reduce(
    (acc, { cantidad, precio }) => acc + cantidad * precio,
    0
  );

  templateFooter.querySelectorAll("td")[0].textContent = cantidad_productos;
  templateFooter.querySelectorAll("span")[0].textContent = valor_total;

  const boton = document.querySelector("vaciar-todo");

  const clone = templateFooter.cloneNode(true);
  fragment.appendChild(clone);
  footer.appendChild(fragment);
};

const btnActions = (e) => {
  if (e.target.classList.contains("btn-info")) {
    const producto = carrito[e.target.dataset.id];
    producto.cantidad++;
    carrito[e.target.dataset.id] = { ...producto };
  }

  if (e.target.classList.contains("btn-danger")) {
    const producto = carrito[e.target.dataset.id];

    producto.cantidad--;
    if (producto.cantidad === 0) {
      delete carrito[e.target.dataset.id];
    } else {
      carrito[e.target.dataset.id] = { ...producto };
    }
  }

  pintarCarro();
};

const crearNewProducto = () => {
  const name = document.getElementById("name").value;
  const precio = document.getElementById("precio").value;
  const image = document.getElementById("image").value;

  if (name === "") {
    alert("El nombre es un campo obligatorio");
    return;
  }

  if (precio === "") {
    alert("El precio es un campo obligatorio");
    return;
  }

  if (image === "") {
    alert("La imagen es un campo obligatorio");
    return;
  }

  const data = {
    id: getRandomInt(1000, 100000),
    name: name,
    precio: precio,
    image: image,
  };
  arrayTemp = [...arrayTemp, data];
  pintarCard(arrayTemp);
  limpiarFormulario();
};

const eliminarProducto = async (e) => {
  if (e.target.classList.contains("btn-danger")) {
    app.innerHTML = "";
    console.log(e.target.dataset.id);
    arrayTemp = await arrayTemp.filter(
      (data) => data.id !== Number(e.target.dataset.id)
    );
    pintarCard(arrayTemp);
  }
};

const ProductoAactualizar = async (e) => {
  if (e.target.classList.contains("btn-info")) {
    document.getElementById("send").hidden = true;
    document.getElementById("editar").hidden = false;
    document.getElementById("idproducto").hidden = false;
    document.getElementById("labelid").hidden = false;

    const data = arrayTemp.find(
      (data) => data.id === Number(e.target.dataset.id)
    );

    if (data) {
      document.getElementById("idproducto").value = data.id;
      document.getElementById("name").value = data.name;
      document.getElementById("precio").value = data.precio;
      document.getElementById("image").value = data.image;
      idEditar = data.id;
    }
  }
};

const actualizarProducto = (e) => {
  app.innerHTML = "";
  const id = document.getElementById("idproducto").value;
  const name = document.getElementById("name").value;
  const precio = document.getElementById("precio").value;
  const image = document.getElementById("image").value;

  if (id === "") {
    alert("Hubo un error, no se encontro el id del producto");
    return;
  }

  if (name === "") {
    alert("El nombre es un campo obligatorio");
    return;
  }

  if (precio === "") {
    alert("El precio es un campo obligatorio");
    return;
  }

  if (image === "") {
    alert("La imagen es un campo obligatorio");
    return;
  }

  const dataUpadte = {
    id: id,
    name: name,
    precio: precio,
    image: image,
  };

  arrayTemp = arrayTemp.map((data) =>
    data.id === Number(id) ? (data = dataUpadte) : data
  );

  pintarCard(arrayTemp);
  limpiarFormulario();
};

const limpiarFormulario = () => {
  document.getElementById("idproducto").value = "";
  document.getElementById("name").value = "";
  document.getElementById("precio").value = "";
  document.getElementById("image").value = "";
  document.getElementById("idproducto").hidden = true;
  document.getElementById("labelid").hidden = true;
  document.getElementById("editar").hidden = true;
  document.getElementById("send").hidden = false;
};
