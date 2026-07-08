import { useState } from 'react'
import EmojiPicker from 'emoji-picker-react'
import apiRequest from '../../utils/apiRequest'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { HiFaceSmile, HiPaperAirplane } from 'react-icons/hi2'

function CommentForm({ id }) {
  const [open, setOpen] = useState(false)
  const [desc, setDesc] = useState("")

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (comment) => apiRequest.post("/comments", comment).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", id] })
      setDesc("")
      setOpen(false)
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!desc.trim()) return
    mutation.mutate({ description: desc, pin: id })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 rounded-2xl border border-line bg-panel/60 p-2 focus-within:border-accent/30 focus-within:glow-ring"
    >
      <input
        type="text"
        placeholder="Add a comment..."
        onChange={(e) => setDesc(e.target.value)}
        value={desc}
        className="flex-1 bg-transparent px-2 py-2 text-sm text-fog outline-none placeholder:text-muted"
      />
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition-colors hover:bg-panel-hover hover:text-fog"
        >
          <HiFaceSmile size={18} />
        </button>
        {open && (
          <div className="absolute right-0 bottom-12 z-50">
            <EmojiPicker
              onEmojiClick={(emoji) => { setDesc(prev => prev + emoji.emoji); setOpen(false) }}
              width="15em"
              height="18em"
            />
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={!desc.trim() || mutation.isPending}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent transition-all hover:bg-accent hover:text-white disabled:opacity-30"
      >
        <HiPaperAirplane size={16} />
      </button>
    </form>
  )
}

export default CommentForm
