import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import store from './store';
import AppLayout from './app/AppLayout.jsx';
import Tracks from './pages/Tracks';
import Albums from './pages/Albums';
import Search from './pages/Search';
import Upload from './pages/Upload';
import 'antd/dist/reset.css';
import "./global.css";

ReactDOM.createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route index element={<Navigate to="/tracks" />} />
                    <Route path="tracks" element={<Tracks />} />
                    <Route path="albums" element={<Albums />} />
                    <Route path="search" element={<Search />} />
                    <Route path="upload" element={<Upload />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </Provider>
);