/**
 * @packageDocumentation
 * @module tree
 * @since 1.0.0 (2025-11-20)
 * @author
 *   Z-kali
 * @description
 *   通用树形结构构建工具：
 *   - 使用 id / pid 字段表达上下级关系
 *   - 使用 sort 字段对同级节点进行升序排序
 *   - 支持配置字段名映射与根节点 pid 值
 */

export interface TreeConfig {
  /**
   * @property {string} [idField]
   * @description 作为唯一标识的字段名，默认 "id"
   */
  idField?: string;

  /**
   * @property {string} [pidField]
   * @description 作为父级标识的字段名，默认 "pid"
   */
  pidField?: string;

  /**
   * @property {string} [sortField]
   * @description 作为同级排序依据的字段名，默认不启用排序字段
   */
  sortField?: string;

  /**
   * @property {string|number|null} [rootPidValue]
   * @description
   *   指定根节点的 pid 值：
   *   - 未设置或为 null：pid 为空或 null 的节点视为根
   *   - 设置为具体值：pid 等于该值的节点视为根
   */
  rootPidValue?: string | number | null;
}

/**
 * @interface TreeNode
 * @description
 *   树形节点类型：
 *   - 继承原始实体字段
 *   - 增加 id/pid/children/sort 等树结构相关字段
 */
export type TreeNode<Entity extends object> = Entity & {
  /**
   * @property {string} id
   * @description 节点 id（已标准化为字符串）
   */
  id: string;

  /**
   * @property {string|null} pid
   * @description 父级节点 id（已标准化为字符串或 null）
   */
  pid: string | null;

  /**
   * @property {number} [sort]
   * @description 同级排序权重（数值越小越靠前）
   */
  sort?: number;

  /**
   * @property {TreeNode<Entity>[]} [children]
   * @description 子节点列表
   */
  children?: TreeNode<Entity>[];
};

/**
 * @interface TreeResult
 * @description 构建树形结构后的结果包装
 */
export interface TreeResult<Entity extends object> {
  /**
   * @property {TreeNode<Entity>[]} data
   * @description 根节点数组
   */
  data: TreeNode<Entity>[];
}

/**
 * @function buildTree
 * @description
 *   根据 id / pid 字段构建上下级树形结构，并基于 sort 字段进行同级排序：
 *   - 使用 id 字段作为唯一标识
 *   - 使用 pid 字段表示父子上下级关系
 *   - sort 字段为可选，同级节点按升序排列
 *   - 支持通过 TreeConfig 自定义字段名与根节点 pid 值
 * @template Entity
 * @param {Entity[]} rows - 原始扁平数据行数组
 * @param {TreeConfig} [config] - 字段映射与根节点配置
 * @returns {TreeResult<Entity>} 树形结构结果
 */
export function buildTree<Entity extends object>(
  rows: Entity[],
  config?: TreeConfig,
): TreeResult<Entity> {
  const idField = (config?.idField ?? "id") as keyof Entity;
  const pidField = (config?.pidField ?? "pid") as keyof Entity;
  const sortField = config?.sortField as keyof Entity | undefined;
  const rootPidValue = config?.rootPidValue ?? null;

  type Node = TreeNode<Entity>;

  const nodeMap = new Map<string, Node>();
  const roots: Node[] = [];

  // 1. 规范化节点：统一生成 id / pid / sort 字段
  for (const row of rows) {
    const idRaw = row[idField];
    const pidRaw = row[pidField];
    const sortRaw = sortField ? row[sortField] : undefined;

    const id = String(idRaw ?? "");
    const pid = pidRaw == null ? null : String(pidRaw);

    let sort: number | undefined;
    if (typeof sortRaw === "number") {
      sort = sortRaw;
    } else if (typeof sortRaw === "string" && sortRaw.trim() !== "") {
      const parsed = Number(sortRaw);
      sort = Number.isFinite(parsed) ? parsed : undefined;
    }

    const node: Node = {
      ...(row as Entity),
      id,
      pid,
      sort,
      children: [],
    } as Node;

    nodeMap.set(id, node);
  }

  // 2. 建立上下级关系：根据 pid 归挂到父节点
  for (const node of nodeMap.values()) {
    const pid = node.pid;

    const isRootByNull =
      pid === null || pid === "" || pid === undefined;
    const isRootByConfig =
      rootPidValue !== null && pid === String(rootPidValue);

    if (isRootByNull || isRootByConfig) {
      roots.push(node);
      continue;
    }

    const parent = nodeMap.get(pid);
    if (parent) {
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(node);
    } else {
      // 找不到父级时视为根节点，避免数据丢失
      roots.push(node);
    }
  }

  // 3. 递归排序：对同级节点按 sort 升序排列
  const sortChildren = (nodes: Node[]): void => {
    if (!nodes.length) {
      return;
    }

    nodes.sort((a, b) => {
      const aSort = a.sort ?? 0;
      const bSort = b.sort ?? 0;
      if (aSort === bSort) {
        return 0;
      }
      return aSort - bSort;
    });

    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        sortChildren(node.children as Node[]);
      }
    }
  };

  sortChildren(roots);

  return { data: roots };
}
