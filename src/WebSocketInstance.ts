
// class WebSocketInstance {
//   static instance = null
//     constructor() {
//       if (WebSocketInstance.instance === null){
//         console.log("hereeeeeeeeee")
//         this.socket = null;
//         this.token = null;
//         this.listeners = [];
//         this.connected = false;
//         WebSocketInstance.instance = this
//       }
//       return WebSocketInstance.instance
//     }

//     // Kết nối WebSocket nếu chưa kết nối
//     connect(token) {
//         if (this.connected) {
//             return; // Nếu đã kết nối, không làm gì cả
//         }

//         if (!token) {
//             throw new Error('Token is required to establish a WebSocket connection.');
//         }

//         this.token = token;
//         this.socket = new WebSocket(`ws://localhost:8080/ws?token=${this.token}`);
//         this.connected = true;

//         this.socket.onopen = () => {
//             console.log("WebSocket connected");
//             this.connected = true;
//             this.notifyListeners('connected');
//         };

//         this.socket.onmessage = (event) => {
//             try {
//                 const data = JSON.parse(event.data);
//                 this.notifyListeners('message', data);
//             } catch (error) {
//                 console.error('WebSocket message error:', error);
//             }
//         };

//         this.socket.onerror = (error) => {
//             console.error("WebSocket error:", error);
//             this.notifyListeners('error', error);
//         };

//         this.socket.onclose = () => {
//             console.log("WebSocket closed");
//             this.connected = false;
//             this.notifyListeners('disconnected');
//         };
//     }

//     // Gửi tin nhắn đến WebSocket
//     sendMessage(message) {
//         if (this.socket && this.socket.readyState === WebSocket.OPEN) {
//             this.socket.send(message);
//         } else {
//             console.error('Cannot send message, WebSocket is not open');
//         }
//     }

//     // Đóng kết nối WebSocket
//     disconnect() {
//         console.log("đóng socket")
//         if (this.socket) {
//             this.socket.close();
//             this.socket = null;
//             this.connected = false;
//             this.instance = null
//         }
//     }

//     // Thêm listener cho các sự kiện WebSocket
//     addListener(event, callback) {
//         this.listeners.push({ event, callback });
//     }

//     // Xóa listener cho WebSocket
//     removeListener(event, callback) {
//         this.listeners = this.listeners.filter(
//             (listener) => !(listener.event === event && listener.callback === callback)
//         );
//     }

//     // Thông báo tất cả listeners về sự kiện
//     notifyListeners(event, data) {
//         this.listeners.forEach(listener => {
//             if (listener.event === event) {
//                 listener.callback(data);
//             }
//         });
//     }

//     // Kiểm tra trạng thái kết nối
//     isConnected() {
//         return this.connected;
//     }

//     print(){
//         console.log(this.socket)
//         console.log(this.token)
//         console.log(this.listeners)
//         console.log(this.connected)
//     }
// }

// // Tạo instance của WebSocketInstance và export để sử dụng ở các nơi khác
// const wsInstance = new WebSocketInstance()
// //Object.freeze(wsInstance)
// export default wsInstance;


class WebSocketInstance {
    private static instance: WebSocketInstance;
    private socket: WebSocket | null = null;
    private token: string | null = null;
    private listeners: { event: string, callback: Function }[] = [];
    private connected = false;

    private constructor() {
        this.socket = null;
        this.token = null;
        this.listeners = [];
        this.connected = false;
    }

    public static getInstance(): WebSocketInstance {
        if (!WebSocketInstance.instance) {
            console.log("Recreate instance")
            WebSocketInstance.instance = new WebSocketInstance();
        }
        return WebSocketInstance.instance;
    }

    public connect(token: string) {
        if (this.connected) return;
        if (!token) throw new Error("Token is required");
        this.token = token;
        this.socket = new WebSocket(`ws://localhost:8080/ws?token=${token}`);
        this.connected = true;

        this.socket.onopen = () => {
            this.connected = true;
            this.notifyListeners("connected");
        };
        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.notifyListeners("message", data);
            } catch (e) {
                console.error("JSON parse error:", e);
            }
        };
        this.socket.onerror = (err) => {
            console.error("WebSocket error:", err);
            this.notifyListeners("error", err);
        };
        this.socket.onclose = () => {
            this.connected = false;
            this.notifyListeners("disconnected");
        };
    }

    public disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.connected = false;
        }
    }

    public sendMessage(msg: string) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(msg);
        } else {
            console.warn("Socket not open.");
        }
    }

    public addListener(event: string, callback: Function) {
        this.listeners.push({ event, callback });
    }

    public removeListener(event: string, callback: Function) {
        this.listeners = this.listeners.filter(l => l.event !== event || l.callback !== callback);
    }

    public isConnected() {
        console.log({connect_satus: this.connected})
        this.print()
        return this.connected;
    }

    private notifyListeners(event: string, data?: any) {
        this.listeners.forEach(l => {
            if (l.event === event) {
                l.callback(data);
            }
        });
    }

    public print() {
        console.log({ socket: this.socket, token: this.token, listeners: this.listeners, connected: this.connected });
    }
}

console.log(WebSocketInstance.getInstance())
export default WebSocketInstance;

console.log(WebSocketInstance.getInstance())

// class CurrentAccount {
//   private static instance: CurrentAccount;
//   private curAcc: Taikhoan | null = null;

//   // Constructor private để đảm bảo Singleton
//   private constructor() {}

//   public static getInstance(): CurrentAccount {
//     if (!CurrentAccount.instance) {
//       CurrentAccount.instance = new CurrentAccount();
//     }
//     return CurrentAccount.instance;
//   }

//   public getData(): Taikhoan | null {
//     return this.curAcc;
//   }

//   public setData(acc: Taikhoan): void {
//     this.curAcc = acc;
//   }
// }

// export default CurrentAccount;

// public class CurrentAccount
// {
//     private static CurrentAccount instance;
//     private Taikhoan curAcc;

//     private CurrentAccount()
//     {
//         curAcc = null;
//     }

//     public static CurrentAccount Instance
//     {
//         get
//         {
//             if (instance == null)
//             {
//                 instance = new CurrentAccount();
//             }
//             return instance;
//         }
//     }

//     public Taikhoan GetData()
//     {
//         return curAcc;
//     }

//     public void SetData(Taikhoan acc)
//     {
//         curAcc = acc;
//     }
// }