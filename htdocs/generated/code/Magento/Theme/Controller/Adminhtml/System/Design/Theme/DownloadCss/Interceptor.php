<?php
namespace Magento\Theme\Controller\Adminhtml\System\Design\Theme\DownloadCss;

/**
 * Interceptor class for @see \Magento\Theme\Controller\Adminhtml\System\Design\Theme\DownloadCss
 */
class Interceptor extends \Magento\Theme\Controller\Adminhtml\System\Design\Theme\DownloadCss implements \Magento\Framework\Interception\InterceptorInterface
{
    use \Magento\Framework\Interception\Interceptor;

    public function __construct(\Magento\Backend\App\Action\Context $context, \Magento\Framework\Registry $coreRegistry, \Magento\Framework\App\Response\Http\FileFactory $fileFactory, \Magento\Framework\View\Asset\Repository $assetRepo, \Magento\Framework\Filesystem $appFileSystem, ?\Magento\Framework\Escaper $escaper = null)
    {
        $this->___init();
        parent::__construct($context, $coreRegistry, $fileFactory, $assetRepo, $appFileSystem, $escaper);
    }

    /**
     * {@inheritdoc}
     */
    public function dispatch(\Magento\Framework\App\RequestInterface $request)
    {
        $pluginInfo = $this->pluginList->getNext($this->subjectType, 'dispatch');
        if (!$pluginInfo) {
            return parent::dispatch($request);
        } else {
            return $this->___callPlugins('dispatch', func_get_args(), $pluginInfo);
        }
    }
}
