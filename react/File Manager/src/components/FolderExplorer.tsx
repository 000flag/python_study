"use client"

import { useState, useEffect } from "react"
import { type Folder, fetchFolders } from "../api/api"
import "../styles/FolderExplorer.css"

interface FolderExplorerProps {
    onFolderSelect: (folderId: string) => void
    selectedFolderId?: string
}

const FolderExplorer: React.FC<FolderExplorerProps> = ({ onFolderSelect, selectedFolderId }) => {
    const [folders, setFolders] = useState<Folder[]>([])
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["1"]))
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadFolders()
    }, [])

    const loadFolders = async () => {
        setLoading(true)
        try {
            const folderData = await fetchFolders()
            setFolders(folderData)
        } catch (error) {
            console.error("폴더 로딩 오류:", error)
        } finally {
            setLoading(false)
        }
    }

    const toggleFolder = (folderId: string) => {
        const newExpanded = new Set(expandedFolders)
        if (newExpanded.has(folderId)) {
            newExpanded.delete(folderId)
        } else {
            newExpanded.add(folderId)
        }
        setExpandedFolders(newExpanded)
    }

    const renderFolder = (folder: Folder, level = 0) => {
        const hasChildren = folder.children && folder.children.length > 0
        const isExpanded = expandedFolders.has(folder.id)
        const isSelected = selectedFolderId === folder.id

        return (
            <li key={folder.id} className="folder-item">
                <button
                    className={`folder-button ${isSelected ? "active" : ""}`}
                    onClick={() => onFolderSelect(folder.id)}
                    style={{ paddingLeft: `${0.75 + level * 1}rem` }}
                >
                    {hasChildren && (
                        <span
                            className={`expand-icon ${isExpanded ? "expanded" : ""}`}
                            onClick={(e) => {
                                e.stopPropagation()
                                toggleFolder(folder.id)
                            }}
                        >
                            ▶
                        </span>
                    )}
                    <span className="folder-icon">📁</span>
                    <span className="folder-name">{folder.name}</span>
                </button>

                {hasChildren && isExpanded && (
                    <ul className="folder-tree folder-children">
                        {folder.children.map((childId) => {
                            const childFolder = folders.find((f) => f.id === childId)
                            return childFolder ? renderFolder(childFolder, level + 1) : null
                        })}
                    </ul>
                )}
            </li>
        )
    }

    const rootFolders = folders.filter((folder) => folder.parentId === null)

    if (loading) {
        return (
            <div className="folder-explorer">
                <div className="panel-content">
                    <div className="text-center p-3">폴더 로딩 중...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="folder-explorer">
            <div className="panel-content">
                <ul className="folder-tree">{rootFolders.map((folder) => renderFolder(folder))}</ul>
            </div>
        </div>
    )
}

export default FolderExplorer