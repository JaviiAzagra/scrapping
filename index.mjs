import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

// Construir `__dirname` manualmente para entornos de módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar readline para pedir datos por consola
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Función para lanzar el navegador y extraer los datos
const scrapeData = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(
    "https://www.coolmod.com/perifericos-alfombrillas/?ordenacion=precio-mayor&pagina=2"
  );

  const products = await page.$$eval(".productInfo", (results) =>
    results.map((el) => {
      const title = el.querySelector(".productName")?.innerText;
      const price = el.querySelector(".pricetotal")?.innerText;
      const priceWithEuro = price ? `${price} €` : null;
      const img = el.querySelector("img").getAttribute("src");
      const type = "ALFOMBRILLAS";

      return { title, price: priceWithEuro, img, type };
    })
  );

  await browser.close();
  return products;
};

// Función para guardar los datos en JSON
const saveDataAsJson = (data, filename) => {
  const dir = path.join(__dirname, "data");

  // Crear la carpeta 'data' si no existe
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  // Ruta completa del archivo
  const filePath = path.join(dir, `${filename}.json`);

  // Guardar los datos en el archivo JSON
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`Datos guardados en: ${filePath}`);
};

// Pedir nombre del archivo al usuario
rl.question("¿Cómo quieres llamar al archivo? ", async (filename) => {
  const products = await scrapeData();

  // Llama a la función para guardar los productos en un archivo JSON
  saveDataAsJson(products, filename);

  // Cerrar readline para que el programa termine
  rl.close();
});
