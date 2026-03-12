'use client'

import { useState } from 'react'
import { AdminRouteWithUser } from '@/lib/services/admin.service'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Eye, EyeOff, Edit, Trash2, Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR, enUS, es } from 'date-fns/locale'
import { useParams } from 'next/navigation'
import { EditRouteDialog } from './edit-route-dialog'
import { Checkbox } from '@/components/ui/checkbox'

interface AdminRoutesTableProps {
  routes: AdminRouteWithUser[]
  onTogglePublished: (id: string, published: boolean) => Promise<void>
  onToggleFeatured: (id: string, featured: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onDeleteBulk: (ids: string[]) => Promise<void>
  onUpdate: (id: string, updates: any) => Promise<void>
  translations: any
}

export function AdminRoutesTable({
  routes,
  onTogglePublished,
  onToggleFeatured,
  onDelete,
  onDeleteBulk,
  onUpdate,
  translations,
}: AdminRoutesTableProps) {
  const params = useParams()
  const locale = params?.locale as string || 'en'
  
  const [selectedRoutes, setSelectedRoutes] = useState<Set<string>>(new Set())
  
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    routeId: string | null
    routeTitle: string
  }>({
    open: false,
    routeId: null,
    routeTitle: '',
  })

  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false)

  const [editDialog, setEditDialog] = useState<{
    open: boolean
    route: AdminRouteWithUser | null
  }>({
    open: false,
    route: null,
  })

  const dateLocale = locale === 'pt' ? ptBR : locale === 'es' ? es : enUS

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/10 text-green-500'
      case 'moderate':
        return 'bg-yellow-500/10 text-yellow-500'
      case 'challenging':
        return 'bg-orange-500/10 text-orange-500'
      case 'expert':
        return 'bg-red-500/10 text-red-500'
      default:
        return 'bg-gray-500/10 text-gray-500'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'scenic':
        return 'bg-blue-500/10 text-blue-500'
      case 'mountain':
        return 'bg-purple-500/10 text-purple-500'
      case 'coastal':
        return 'bg-cyan-500/10 text-cyan-500'
      case 'weekend':
        return 'bg-pink-500/10 text-pink-500'
      case 'adventure':
        return 'bg-amber-500/10 text-amber-500'
      default:
        return 'bg-gray-500/10 text-gray-500'
    }
  }

  const handleDelete = async () => {
    if (deleteDialog.routeId) {
      await onDelete(deleteDialog.routeId)
      setDeleteDialog({ open: false, routeId: null, routeTitle: '' })
    }
  }

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedRoutes)
    await onDeleteBulk(ids)
    setSelectedRoutes(new Set())
    setBulkDeleteDialog(false)
  }

  const handleEdit = async (updates: any) => {
    if (editDialog.route) {
      await onUpdate(editDialog.route.id, updates)
      setEditDialog({ open: false, route: null })
    }
  }

  const toggleSelectRoute = (id: string) => {
    const newSelected = new Set(selectedRoutes)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRoutes(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedRoutes.size === routes.length) {
      setSelectedRoutes(new Set())
    } else {
      setSelectedRoutes(new Set(routes.map(r => r.id)))
    }
  }

  const isAllSelected = routes.length > 0 && selectedRoutes.size === routes.length
  const isSomeSelected = selectedRoutes.size > 0 && selectedRoutes.size < routes.length

  return (
    <>
      {selectedRoutes.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedRoutes.size} {translations.selectedRoutes || 'rotas selecionadas'}
            </span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setBulkDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {translations.deleteSelected || 'Deletar Selecionadas'}
          </Button>
        </div>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                  className={isSomeSelected ? "opacity-50" : ""}
                />
              </TableHead>
              <TableHead>{translations.title}</TableHead>
              <TableHead>{translations.user}</TableHead>
              <TableHead>{translations.category}</TableHead>
              <TableHead>{translations.difficulty}</TableHead>
              <TableHead className="text-right">{translations.distance}</TableHead>
              <TableHead className="text-center">{translations.status}</TableHead>
              <TableHead className="text-center">{translations.featured}</TableHead>
              <TableHead>{translations.created}</TableHead>
              <TableHead className="text-right">{translations.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  {translations.noRoutes}
                </TableCell>
              </TableRow>
            ) : (
              routes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRoutes.has(route.id)}
                      onCheckedChange={() => toggleSelectRoute(route.id)}
                      aria-label={`Select ${route.title}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {route.title}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {route.user_name || 'Unknown'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {route.user_email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(route.category)}>
                      {translations.categories[route.category]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getDifficultyColor(route.difficulty)}>
                      {translations.difficulties[route.difficulty]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {route.distance_km.toFixed(1)} km
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTogglePublished(route.id, !route.published)}
                    >
                      {route.published ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleFeatured(route.id, !route.featured)}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          route.featured ? 'fill-yellow-500 text-yellow-500' : 'text-gray-500'
                        }`}
                      />
                    </Button>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(route.created_at), {
                      addSuffix: true,
                      locale: dateLocale,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditDialog({ open: true, route })}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDeleteDialog({
                            open: true,
                            routeId: route.id,
                            routeTitle: route.title,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteDialog} onOpenChange={setBulkDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{translations.bulkDeleteTitle || 'Deletar Rotas'}</DialogTitle>
            <DialogDescription>
              {translations.bulkDeleteDescription?.replace('{count}', selectedRoutes.size.toString()) || 
                `Tem certeza que deseja deletar ${selectedRoutes.size} rotas? Esta ação não pode ser desfeita.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDeleteDialog(false)}
            >
              {translations.cancel}
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete}>
              {translations.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, routeId: null, routeTitle: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{translations.deleteTitle}</DialogTitle>
            <DialogDescription>
              {translations.deleteDescription}
              <br />
              <strong className="mt-2 block text-foreground">{deleteDialog.routeTitle}</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, routeId: null, routeTitle: '' })}
            >
              {translations.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {translations.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editDialog.route && (
        <EditRouteDialog
          open={editDialog.open}
          route={editDialog.route}
          onClose={() => setEditDialog({ open: false, route: null })}
          onSave={handleEdit}
          translations={translations}
        />
      )}
    </>
  )
}
