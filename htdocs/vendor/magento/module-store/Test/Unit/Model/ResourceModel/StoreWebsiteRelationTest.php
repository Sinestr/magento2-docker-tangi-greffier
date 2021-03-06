<?php
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

namespace Magento\Store\Test\Unit\Model\ResourceModel;

use Magento\Framework\App\ResourceConnection;
use Magento\Framework\DB\Adapter\AdapterInterface;
use Magento\Framework\DB\Select;
use Magento\Store\Model\ResourceModel\StoreWebsiteRelation;

class StoreWebsiteRelationTest extends \PHPUnit\Framework\TestCase
{
    /** @var  StoreWebsiteRelation */
    private $model;

    /** @var  ResourceConnection | \PHPUnit\Framework\MockObject\MockObject */
    private $resourceConnection;

    /** @var  AdapterInterface | \PHPUnit\Framework\MockObject\MockObject */
    private $connection;

    /** @var  Select | \PHPUnit\Framework\MockObject\MockObject */
    private $select;

    protected function setUp(): void
    {
        $this->select = $this->getMockBuilder(Select::class)
            ->disableOriginalConstructor()
            ->getMock();
        $this->resourceConnection = $this->getMockBuilder(ResourceConnection::class)
            ->disableOriginalConstructor()
            ->getMock();
        $this->connection = $this->getMockForAbstractClass(AdapterInterface::class);

        $this->model = new StoreWebsiteRelation($this->resourceConnection);
    }

    public function testGetStoreByWebsiteId()
    {
        $data = ['ololo'];
        $websiteId = 1;
        $storeTable = 'store';
        $this->resourceConnection->expects($this->once())
            ->method('getConnection')
            ->willReturn($this->connection);
        $this->resourceConnection->expects($this->once())
            ->method('getTableName')
            ->willReturn($storeTable);
        $this->connection->expects($this->once())
            ->method('select')
            ->willReturn($this->select);

        $this->select->expects($this->once())
            ->method('from')
            ->with($storeTable, ['store_id'])
            ->willReturn($this->select);
        $this->select->expects($this->once())
            ->method('where')
            ->with('website_id = ?', $websiteId)
            ->willReturn($this->select);
        $this->connection->expects($this->once())
            ->method('fetchCol')
            ->willReturn($data);

        $this->assertEquals($data, $this->model->getStoreByWebsiteId($websiteId));
    }
}
