import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';

function App() {
    useEffect(() => {
        // 使用你提供的老师 Token
        const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IkJBNjkzMTlCMTE2OTFFOUZEODI5MTQwNThFQzIwNDlDMzVFRDc2N0YiLCJ4NXQiOiJ1bWt4bXhGcEhwX1lLUlFGanNJRW5EWHRkbjgiLCJ0eXAiOiJhdCtqd3QifQ.eyJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo0NDMzOC8iLCJleHAiOjE3NjgxOTgwMDUsImlhdCI6MTc2ODE5NDQwNSwiYXVkIjoiU2VydmljZURlc2siLCJzY29wZSI6IlNlcnZpY2VEZXNrIHJvbGVzIHByb2ZpbGUgZW1haWwiLCJqdGkiOiJiNmMzM2M3MC1kMTg4LTRkMzctYmU5Mi1hZmYyZDQyMWM4MTkiLCJzdWIiOiIzYTFlYzJjNS0zMjRkLWQyYzQtNTk3NS01ODU2ODBkNjM4YWEiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJ0ZWFjaGVyIiwiZW1haWwiOiJ0ZWFjaGVyQHRlc3QuY29tIiwicm9sZSI6IlRlYWNoZXIiLCJmYW1pbHlfbmFtZSI6InRlYWNoZXIiLCJwaG9uZV9udW1iZXJfdmVyaWZpZWQiOiJGYWxzZSIsImVtYWls_vlcmlmaWVkIjoiRmFsc2UiLCJ1bmlxdWVfbmFtZSI6InRlYWNoZXIiLCJvaV9wcnN0IjoiU2VydmljZURlc2tfU3dhZ2dlciIsImNsaWVudF9pZCI6IlNlcnZpY2VEZXNrX1N3YWdnZXIiLCJvaV90a25faWQiOiIzYTFlYzJjNi00YjljLWExNzgtMmQ0Yi02ZjhkMzlkMWU5NDEifQ.PBJ2YUG9tra7suFmsafXVC2WWnmPw9juuqsNyK_MqG2jyeg-cRjFb9OowKglU98wNuTdRBl2EVj9B8iur17e1rO2V3JVldAdr9OZ0Jl1yGiPANJT5p1mu9sCpmzsM2wejPn7mIjlzEYTanzni6MoeSgqbsoCeiywpJlOBcArsbM9ef39plMrZWiisveICXimR_kMF5FMyAgDiRhxYIy2vFmEldGk36hA1EfJQglLRxADasxJUQgrEIln0Q7QP2hbi7UBLM3geJ_WtjU34hLTLwHliF4CbyKWBajtoPu_gbtNYCoUFY9epuvIpI7Tl01eNJTNcKdoqnvj-ZX-79CwEA';

        // 报修单具体 ID (来自你上一步提供的 JSON 数据)
        const repairId = '3a1ec2cd-c19a-f616-fa56-bbf8510238f6';

        // 发起详情接口请求
        // 路径说明：/dev-api (代理) + /api/app/repair-request/{id}/detail (后端真实路由)
        axios.get(`/dev-api/api/app/repair-request/${repairId}/detail`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => {
                console.log("✅ 老师详情请求成功！单据标题：", res.data.title);
                console.log("完整数据：", res.data);
            })
            .catch(err => {
                console.error("❌ 代理请求失败：");
                if (err.response) {
                    // 服务器返回了错误状态码 (404, 403, 401 等)
                    console.error("状态码:", err.response.status);
                    console.error("错误信息:", err.response.data);
                } else {
                    // 网络错误或代理服务器未启动
                    console.error("错误详情:", err.message);
                }
            });
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                <h3 style={{ color: '#61dafb' }}>老师端 - 报修详情代理测试</h3>
                <p style={{ fontSize: '14px', color: '#bbb' }}>请求 ID: 3a1ec2cd...</p>

                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    按 <b>F12</b> 查看 Console 里的老师报修数据
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
        </div>
    );
}

export default App;