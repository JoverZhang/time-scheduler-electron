import React, { SyntheticEvent } from 'react'
import { Box, colors, styled, Typography } from '@mui/material'
import { TreeItem, treeItemClasses, TreeItemProps, TreeView } from '@mui/lab'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Config } from '@/common/context'
import Label from '@mui/icons-material/Label'


interface TaskTreeItemProps extends TreeItemProps {
  text: string
  runtime: number
  expectRuntime: number
}

const TaskTreeItem = ({ text, runtime, expectRuntime, ...other }: TaskTreeItemProps) => {
  const StyledTreeItem = styled(TreeItem)(({ theme }) => ({
    [`& .${treeItemClasses.content}`]: {
      padding: 0,
      borderTopRightRadius: theme.spacing(2),
      borderBottomRightRadius: theme.spacing(2),
      [`& .${treeItemClasses.label}`]: {
        fontWeight: theme.typography.fontWeightMedium,
      },
    },
    [`& .${treeItemClasses.expanded} .runtime`]: {
      color: colors.red[500],
    },
  }))

  return (
    <StyledTreeItem
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 1 }}>
          <Box component={Label} color="inherit" sx={{ mr: 2 }} />
          <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
            {text}
          </Typography>
          <Typography className="runtime" variant="caption" color="inherit">
            {expectRuntime - runtime}/{expectRuntime}
          </Typography>
        </Box>
      }
      {...other}
    />
  )
}

interface Props {
  config: Config
}


export default function TreeNav({ config }: Props) {
  return (
    <Box sx={{ height: '100%', flexGrow: 1, maxWidth: 350, overflowY: 'auto' }}>
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        onNodeSelect={(_: SyntheticEvent, node: string) => console.log(node)}
      >
        <TaskTreeItem
          nodeId="daily"
          text="Daily"
          runtime={config.dailyTasks.map(t => t.getRuntime()).reduce((a, b) => a + b, 0)}
          expectRuntime={config.dailyTasks.map(t => t.getRequiredTime()).reduce((a, b) => a + b, 0)}
        >{
          config.dailyTasks.map(task =>
            <TaskTreeItem
              key={task.id}
              nodeId={task.id.toString()}
              text={task.title}
              runtime={task.getRuntime()}
              expectRuntime={task.getRequiredTime()}
            />)
        }
        </TaskTreeItem>

        <TaskTreeItem
          nodeId="weekly"
          text="Weekly"
          runtime={config.weeklyTasks.map(t => t.getRuntime()).reduce((a, b) => a + b, 0)}
          expectRuntime={config.weeklyTasks.map(t => t.getRequiredTime()).reduce((a, b) => a + b, 0)}
        >{
          config.weeklyTasks.map(task =>
            <TaskTreeItem
              key={task.id}
              nodeId={task.id.toString()}
              text={task.title}
              runtime={task.getRuntime()}
              expectRuntime={task.getRequiredTime()}
            />)
        }
        </TaskTreeItem>

        <TaskTreeItem
          nodeId="unlimited"
          text="Unlimited"
          runtime={config.unlimitedTasks.map(t => t.getRuntime()).reduce((a, b) => a + b, 0)}
          expectRuntime={config.unlimitedTasks.map(t => t.getRequiredTime()).reduce((a, b) => a + b, 0)}
        >{
          config.unlimitedTasks.map(task =>
            <TaskTreeItem
              key={task.id}
              nodeId={task.id.toString()}
              text={task.title}
              runtime={task.getRuntime()}
              expectRuntime={task.getRequiredTime()}
            />)
        }
        </TaskTreeItem>
      </TreeView>
    </Box>
  )
}
