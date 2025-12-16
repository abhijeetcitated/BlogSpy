"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { SchemaTypeConfig, SchemaField } from "../types"

interface SchemaFormProps {
  config: SchemaTypeConfig
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
}

export function SchemaForm({ config, data, onChange }: SchemaFormProps) {
  const handleFieldChange = (fieldId: string, value: unknown) => {
    onChange({ ...data, [fieldId]: value })
  }

  const handleArrayAdd = (field: SchemaField) => {
    const currentArray = (data[field.id] as unknown[]) || []
    const newItem = field.arrayItemType === 'object' 
      ? field.arrayItemFields?.reduce((acc, f) => ({ ...acc, [f.id]: '' }), {}) || {}
      : ''
    onChange({ ...data, [field.id]: [...currentArray, newItem] })
  }

  const handleArrayRemove = (fieldId: string, index: number) => {
    const currentArray = (data[fieldId] as unknown[]) || []
    onChange({ 
      ...data, 
      [fieldId]: currentArray.filter((_, i) => i !== index) 
    })
  }

  const handleArrayItemChange = (
    fieldId: string, 
    index: number, 
    subFieldId: string | null, 
    value: unknown
  ) => {
    const currentArray = (data[fieldId] as unknown[]) || []
    const newArray = [...currentArray]
    
    if (subFieldId) {
      newArray[index] = { ...(newArray[index] as Record<string, unknown>), [subFieldId]: value }
    } else {
      newArray[index] = value
    }
    
    onChange({ ...data, [fieldId]: newArray })
  }

  const renderField = (field: SchemaField) => {
    const value = data[field.id]

    switch (field.type) {
      case 'text':
        return (
          <Input
            placeholder={field.placeholder}
            value={(value as string) || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="bg-background"
          />
        )

      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            value={(value as string) || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="bg-background min-h-20"
          />
        )

      case 'url':
        return (
          <Input
            type="url"
            placeholder={field.placeholder}
            value={(value as string) || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="bg-background"
          />
        )

      case 'date':
        return (
          <Input
            type="date"
            value={(value as string) || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="bg-background"
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            placeholder={field.placeholder}
            value={(value as number) || ''}
            min={field.min}
            max={field.max}
            onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value) || 0)}
            className="bg-background"
          />
        )

      case 'rating':
        return (
          <Input
            type="number"
            placeholder="1-5"
            value={(value as number) || ''}
            min={1}
            max={5}
            step={0.1}
            onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value) || 0)}
            className="bg-background"
          />
        )

      case 'select':
        return (
          <Select
            value={(value as string) || field.defaultValue as string || ''}
            onValueChange={(v) => handleFieldChange(field.id, v)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'array':
        const arrayValue = (value as unknown[]) || []
        return (
          <div className="space-y-3">
            {arrayValue.map((item, index) => (
              <div 
                key={index} 
                className="p-3 rounded-lg bg-muted/30 border border-border space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Item {index + 1}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleArrayRemove(field.id, index)}
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {field.arrayItemType === 'object' && field.arrayItemFields ? (
                  <div className="space-y-3">
                    {field.arrayItemFields.map((subField) => (
                      <div key={subField.id}>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          {subField.name}
                          {subField.required && <span className="text-red-400 ml-1">*</span>}
                        </label>
                        {subField.type === 'textarea' ? (
                          <Textarea
                            placeholder={subField.placeholder}
                            value={((item as Record<string, unknown>)[subField.id] as string) || ''}
                            onChange={(e) => handleArrayItemChange(field.id, index, subField.id, e.target.value)}
                            className="bg-background min-h-15"
                          />
                        ) : (
                          <Input
                            placeholder={subField.placeholder}
                            value={((item as Record<string, unknown>)[subField.id] as string) || ''}
                            onChange={(e) => handleArrayItemChange(field.id, index, subField.id, e.target.value)}
                            className="bg-background"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Input
                    placeholder={field.placeholder}
                    value={(item as string) || ''}
                    onChange={(e) => handleArrayItemChange(field.id, index, null, e.target.value)}
                    className="bg-background"
                  />
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleArrayAdd(field)}
              className="w-full"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add {field.name.replace(' Items', '').replace('s', '')}
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {config.fields.map((field) => (
        <div key={field.id}>
          <div className="flex items-center gap-2 mb-1.5">
            <label className="text-sm font-medium text-foreground">
              {field.name}
            </label>
            {field.required && (
              <Badge variant="outline" className="text-[10px] h-4 text-amber-400 border-amber-400/30">
                Required
              </Badge>
            )}
          </div>
          {field.description && (
            <p className="text-xs text-muted-foreground mb-2">{field.description}</p>
          )}
          {renderField(field)}
        </div>
      ))}
    </div>
  )
}
