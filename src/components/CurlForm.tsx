
import { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Copy, Cookie, FileOutput, Binary, FileText, Link } from "lucide-react";
import { toast } from "sonner";
import { usePostHog } from "posthog-js/react";

interface Header {
  key: string;
  value: string;
}

type DataFormatType = "raw" | "binary" | "urlencoded";

interface CurlOptions {
  method: string;
  url: string;
  headers: Header[];
  data: string;
  dataFormat: DataFormatType;
  insecure: boolean;
  compressed: boolean;
  verbose: boolean;
  includeCookies: boolean;
  cookieInputFile: string;
  cookieOutputFile: string;
  outputFile: string;
  useOutputFile: boolean;
}

const CurlForm = () => {
  const [options, setOptions] = useState<CurlOptions>({
    method: "GET",
    url: "https://api.example.com",
    headers: [{ key: "Content-Type", value: "application/json" }],
    data: JSON.stringify({ example: "data" }, null, 2),
    dataFormat: "raw",
    insecure: false,
    compressed: false,
    verbose: false,
    includeCookies: false,
    cookieInputFile: "cookies.txt",
    cookieOutputFile: "cookies.txt",
    outputFile: "output.txt",
    useOutputFile: false,
  });

  const [curlCommand, setCurlCommand] = useState("");
  const posthog = usePostHog()


  const addHeader = useCallback(() => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      headers: [...prevOptions.headers, { key: "", value: "" }],
    }));
  }, []);

  const updateHeader = useCallback((index: number, field: "key" | "value", value: string) => {
    setOptions((prevOptions) => {
      const newHeaders = [...prevOptions.headers];
      newHeaders[index] = { ...newHeaders[index], [field]: value };
      return { ...prevOptions, headers: newHeaders };
    });
  }, []);

  const removeHeader = useCallback((index: number) => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      headers: prevOptions.headers.filter((_, i) => i !== index),
    }));
  }, []);

  const generateCurlCommand = useCallback(() => {
    let command = "curl";

    // Add flags
    if (options.insecure) command += " -k";
    if (options.verbose) command += " -v";
    if (options.compressed) command += " --compressed";
    
    // Add cookie handling
    if (options.includeCookies) {
      if (options.cookieInputFile) {
        command += ` -b "${options.cookieInputFile}"`;
      }
      if (options.cookieOutputFile) {
        command += ` -c "${options.cookieOutputFile}"`;
      }
    }

    // Add output file option
    if (options.useOutputFile && options.outputFile) {
      command += ` -o "${options.outputFile}"`;
    }

    // Add method
    if (options.method !== "GET") {
      command += ` -X ${options.method}`;
    }

    // Add headers
    options.headers.forEach((header) => {
      if (header.key && header.value) {
        command += ` -H "${header.key}: ${header.value}"`;
      }
    });

    // Add data with format
    if (["POST", "PUT", "PATCH"].includes(options.method) && options.data) {
      switch(options.dataFormat) {
        case "binary":
          command += ` --data-binary '${options.data.replace(/'/g, "\\'")}'`;
          break;
        case "urlencoded":
          command += ` --data-urlencode '${options.data.replace(/'/g, "\\'")}'`;
          break;
        case "raw":
        default:
          command += ` -d '${options.data.replace(/'/g, "\\'")}'`;
          break;
      }
    }

    // Add URL
    command += ` "${options.url}"`;

    setCurlCommand(command);
  }, [options]);

  // Update curl command when options change
  useEffect(() => {
    generateCurlCommand();
  }, [generateCurlCommand, options]);


  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(curlCommand);
      posthog?.capture('copy_curl')
      toast.success("The curl command has been copied to your clipboard!");
    } catch (err) {
      toast.error("Failed to copy to clipboard. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="shadow-lg border-t-4 border-t-curl">
        <CardContent className="p-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="headers">Headers</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <Label htmlFor="method">Method</Label>
                  <Select
                    value={options.method}
                    onValueChange={(value) => setOptions({ ...options, method: value })}
                  >
                    <SelectTrigger id="method">
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="HEAD">HEAD</SelectItem>
                      <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-3">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={options.url}
                    onChange={(e) => setOptions({ ...options, url: e.target.value })}
                    placeholder="https://api.example.com"
                  />
                </div>
              </div>

              {["POST", "PUT", "PATCH"].includes(options.method) && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="body">Request Body</Label>
                    <Textarea
                      id="body"
                      value={options.data}
                      onChange={(e) => setOptions({ ...options, data: e.target.value })}
                      placeholder="Request body"
                      className="font-mono h-40"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="data-format">Data Format</Label>
                    <Select
                      value={options.dataFormat}
                      onValueChange={(value: DataFormatType) => setOptions({ ...options, dataFormat: value })}
                    >
                      <SelectTrigger id="data-format" className="w-full">
                        <SelectValue placeholder="Select data format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="raw" className="flex items-center">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            <span>Raw (-d)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="binary" className="flex items-center">
                          <div className="flex items-center">
                            <Binary className="h-4 w-4 mr-2" />
                            <span>Binary (--data-binary)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="urlencoded" className="flex items-center">
                          <div className="flex items-center">
                            <Link className="h-4 w-4 mr-2" />
                            <span>URL Encoded (--data-urlencode)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      {options.dataFormat === "raw" && "Sends data as-is (-d flag)"}
                      {options.dataFormat === "binary" && "Sends data exactly as specified with no extra processing (--data-binary flag)"}
                      {options.dataFormat === "urlencoded" && "URL encodes the data before sending (--data-urlencode flag)"}
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="headers" className="space-y-4">
              {options.headers.map((header, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-8 gap-2 items-end">
                  <div className="md:col-span-3">
                    <Label htmlFor={`header-key-${index}`} className="text-sm">
                      Header Name
                    </Label>
                    <Input
                      id={`header-key-${index}`}
                      value={header.key}
                      onChange={(e) => updateHeader(index, "key", e.target.value)}
                      placeholder="Header name"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <Label htmlFor={`header-value-${index}`} className="text-sm">
                      Value
                    </Label>
                    <Input
                      id={`header-value-${index}`}
                      value={header.value}
                      onChange={(e) => updateHeader(index, "value", e.target.value)}
                      placeholder="Header value"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeHeader(index)}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addHeader} className="w-full mt-2">
                <Plus className="h-4 w-4 mr-2" /> Add Header
              </Button>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="insecure"
                    checked={options.insecure}
                    onCheckedChange={(checked) => 
                      setOptions({ ...options, insecure: checked === true })
                    }
                  />
                  <Label htmlFor="insecure">Insecure (-k)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verbose"
                    checked={options.verbose}
                    onCheckedChange={(checked) => 
                      setOptions({ ...options, verbose: checked === true })
                    }
                  />
                  <Label htmlFor="verbose">Verbose (-v)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="compressed"
                    checked={options.compressed}
                    onCheckedChange={(checked) => 
                      setOptions({ ...options, compressed: checked === true })
                    }
                  />
                  <Label htmlFor="compressed">Compressed (--compressed)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cookies"
                    checked={options.includeCookies}
                    onCheckedChange={(checked) => 
                      setOptions({ ...options, includeCookies: checked === true })
                    }
                  />
                  <Label htmlFor="cookies">Cookie handling</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="output-file"
                    checked={options.useOutputFile}
                    onCheckedChange={(checked) => 
                      setOptions({ ...options, useOutputFile: checked === true })
                    }
                  />
                  <Label htmlFor="output-file">Save to file (-o)</Label>
                </div>
              </div>

              {options.includeCookies && (
                <div className="space-y-4 border border-gray-200 rounded-md p-4 mt-2">
                  <div className="flex items-center space-x-2 mb-3">
                    <Cookie className="h-5 w-5 text-curl" />
                    <h3 className="text-base font-medium">Cookie Settings</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cookie-input">Cookie Input File (-b)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cookie-input"
                        value={options.cookieInputFile}
                        onChange={(e) => setOptions({ ...options, cookieInputFile: e.target.value })}
                        placeholder="cookie-in.txt"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Specifies the file to read cookies from (-b flag)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cookie-output">Cookie Output File (-c)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cookie-output"
                        value={options.cookieOutputFile}
                        onChange={(e) => setOptions({ ...options, cookieOutputFile: e.target.value })}
                        placeholder="cookie-out.txt"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Specifies the file to write cookies to (-c flag)
                    </p>
                  </div>
                </div>
              )}

              {options.useOutputFile && (
                <div className="space-y-4 border border-gray-200 rounded-md p-4 mt-2">
                  <div className="flex items-center space-x-2 mb-3">
                    <FileOutput className="h-5 w-5 text-curl" />
                    <h3 className="text-base font-medium">Output File Settings</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="output-file-path">Output File Path (-o)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="output-file-path"
                        value={options.outputFile}
                        onChange={(e) => setOptions({ ...options, outputFile: e.target.value })}
                        placeholder="output.txt"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Specifies the file to write the response to (-o flag)
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="mt-6 shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-2">
            <Label className="text-lg font-medium">Generated Curl Command</Label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyToClipboard}
              className="flex items-center"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
          <div className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto">
            <pre className="whitespace-pre-wrap break-words font-mono text-sm">
              {curlCommand}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CurlForm;
