import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
import fetch from "node-fetch";

// Configuración de Ollama (asumiendo que corre en localhost)
const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";

// Inicializamos el MCP Server
const server = new Server(
    { name: "tga-ai-hardware", version: "1.0.0" },
    { capabilities: { tools: {} } }
);

// Función auxiliar para llamar a Ollama localmente
async function askLocalModel(prompt, model, system = "") {
    try {
        const response = await fetch(OLLAMA_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: model,
                system: system,
                prompt: prompt,
                stream: false,
                options: { temperature: 0.1 }
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}. ¿Está corriendo Ollama en 11434 y tienes el modelo '${model}' descargado?`);
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        throw new Error(`Error comunicando con Ollama: ${error.message}`);
    }
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: "diagnose_log_local",
            description: "Lee un archivo de log masivo y usa un modelo local en la NPU/GPU para encontrar la causa raíz del error.",
            inputSchema: {
                type: "object",
                properties: {
                    logPath: { type: "string", description: "Ruta absoluta al archivo de texto o log" },
                    model: { type: "string", description: "Modelo local de Ollama a usar (ej: llama3, phi3)", default: "llama3" }
                },
                required: ["logPath"]
            }
        },
        {
            name: "generate_bulk_ui_local",
            description: "Usa un modelo Coder en la GPU para generar componentes HTML/CSS repetitivos en lote y los guarda a disco directamente.",
            inputSchema: {
                type: "object",
                properties: {
                    prompt: { type: "string", description: "Descripción detallada de la UI a crear" },
                    outputDir: { type: "string", description: "Ruta de la carpeta donde guardar los archivos generados" },
                    fileName: { type: "string", description: "Nombre base del archivo (ej: card.html)" },
                    model: { type: "string", description: "Modelo coder de Ollama (ej: qwen2.5-coder, deepseek-coder)", default: "qwen2.5-coder" }
                },
                required: ["prompt", "outputDir", "fileName"]
            }
        }
    ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        if (request.params.name === "diagnose_log_local") {
            const { logPath, model } = request.params.arguments;

            // Leer archivo log
            const content = await fs.readFile(logPath, "utf-8");

            // Si el log es inmenso (miles de lineas), tomamos las ultimas 2000 lineas asumiendo que el error esta al final
            const lines = content.split('\\n');
            const relevantLogs = lines.slice(-2000).join('\\n');

            const systemPrompt = "Eres un analista experto de logs. Analiza este volcado de terminal/log y dime EXTREMADAMENTE RESUMIDO (máximo 3 líneas) cuál es el error exacto y en qué archivo/línea ocurrió. Ignora advertencias no críticas.";

            const diagnosis = await askLocalModel(`Log:\n\n${relevantLogs}`, model || "llama3", systemPrompt);

            return {
                content: [{
                    type: "text",
                    text: `[Diagnóstico de Hardware Local - ${model}]:\n\n${diagnosis}`
                }]
            };
        }

        if (request.params.name === "generate_bulk_ui_local") {
            const { prompt, outputDir, fileName, model } = request.params.arguments;

            const systemPrompt = "Eres un ingeniero UI experto. Solo devuelves código puro HTML/CSS/JS. NADA DE MARKDOWN, ni explicaciones, ni etiquetas de código ```. SOLO el código puro.";

            const generatedCode = await askLocalModel(prompt, model || "qwen2.5-coder", systemPrompt);

            // Asegurar directorio
            await fs.mkdir(outputDir, { recursive: true });
            const fullPath = path.join(outputDir, fileName);

            await fs.writeFile(fullPath, generatedCode, "utf-8");

            return {
                content: [{
                    type: "text",
                    text: `[Albañil UI Local - ${model}]: Trabajo completado. Código crudo generado sin gastar tokens de la IA central. Archivo guardado exitosamente en: ${fullPath}`
                }]
            };
        }

        throw new Error("Tool not found");
    } catch (err) {
        return {
            content: [{ type: "text", text: `Error en MCP AI Hardware: ${err.message}` }],
            isError: true,
        };
    }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("AI Hardware MCP Server Started");
